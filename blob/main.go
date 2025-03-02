package main

import (
	"blob/tracing"
	"context"
	"encoding/json"
	"fmt"
	"log"
	"net/http"
	"net/url"
	"os"
	"strconv"
	"strings"
	"time"

	"github.com/Azure/azure-sdk-for-go/sdk/azcore/to"
	"github.com/Azure/azure-sdk-for-go/sdk/storage/azblob"
	"github.com/Azure/azure-sdk-for-go/sdk/storage/azblob/blob"
	"github.com/Azure/azure-sdk-for-go/sdk/storage/azblob/container"
	"github.com/Azure/azure-sdk-for-go/sdk/storage/azblob/sas"

	"github.com/joho/godotenv"
	"go.opentelemetry.io/contrib/instrumentation/net/http/otelhttp"
	"go.opentelemetry.io/otel"
	"go.opentelemetry.io/otel/attribute"
	"go.opentelemetry.io/otel/propagation"
)

const MAX_UPLOAD_SIZE = 1e9 // 1GB

func validateAndGetEnvs() map[string]interface{} {
	m := make(map[string]interface{})

	env := os.Getenv("ENV")
	if env == "" {
		env = "development"
	}
	m["ENV"] = env

	api_key := os.Getenv("API_KEY")

	if api_key == "" {
		log.Fatalln("missing env API_KEY")
	}
	m["API_KEY"] = api_key

	enableTracing := os.Getenv("ENABLE_TRACING")
	m["ENABLE_TRACING"] = enableTracing == "1"

	azConnStr := os.Getenv("AZ_CONN_STR")
	if azConnStr == "" {
		log.Fatalln("missing env AZ_CONN_STR")
	}
	m["AZ_CONN_STR"] = azConnStr

	aspectoAPIKey := os.Getenv("ASPECTO_API_KEY")
	if aspectoAPIKey == "" {
		log.Fatalln("missing env ASPECTO_API_KEY")
	}
	m["ASPECTO_API_KEY"] = aspectoAPIKey

	azContainerName := os.Getenv("AZ_CONTAINER_NAME")
	if azContainerName == "" {
		azContainerName = "assets"
	}

	m["AZ_CONTAINER_NAME"] = azContainerName

	port := os.Getenv("PORT")
	parsedPort, err := strconv.Atoi(port)
	if err != nil || parsedPort < 3000 {
		parsedPort = 4000
	}
	m["PORT"] = parsedPort

	return m
}

func authMiddleware(apiKey string, h http.Handler) http.HandlerFunc {
	return http.HandlerFunc(func(w http.ResponseWriter, r *http.Request) {

		if r.Header.Get("X-API-KEY") != apiKey {
			http.Error(w, "Unauthorized", http.StatusUnauthorized)
			return
		}
		h.ServeHTTP(w, r)
	})
}

func uploadHandler(blobClient *azblob.Client, skCredential *azblob.SharedKeyCredential, containerName string) http.HandlerFunc {
	return func(w http.ResponseWriter, r *http.Request) {
		if r.Method != "POST" {
			http.Error(w, "Method not allowed", http.StatusMethodNotAllowed)
			return
		}
		defer r.Body.Close()

		propagator := otel.GetTextMapPropagator()
		ctx := propagator.Extract(r.Context(), propagation.HeaderCarrier(r.Header))
		_, span := tracing.Tracer.Start(ctx, "upload to az blob")
		defer span.End()

		contentType := r.Header.Get("Content-Type")
		if !strings.Contains(contentType, "multipart/form-data") {
			err := fmt.Errorf("content type mismatch. expected multipart/form-data | received %s", contentType)
			span.SetAttributes(attribute.String("status_message", "error"))
			span.RecordError(err)
			http.Error(w, err.Error(), http.StatusBadRequest)
			return
		}

		r.Body = http.MaxBytesReader(w, r.Body, MAX_UPLOAD_SIZE)
		if err := r.ParseMultipartForm(MAX_UPLOAD_SIZE); err != nil {
			log.Printf("error: %v", err)
			span.SetAttributes(attribute.String("status_message", "error"))
			span.RecordError(err)
			http.Error(w, "The uploaded file is too big. Please choose an file that's less than 1GB in size", http.StatusBadRequest)
			return
		}

		source := r.FormValue("source")
		if source == "" {
			err := fmt.Errorf("missing source")
			span.SetAttributes(attribute.String("status_message", "error"))
			span.RecordError(err)
			http.Error(w, err.Error(), http.StatusBadRequest)
			return
		}

		shouldGenerateSAS := r.FormValue("generateSAS") == "1"
		span.SetAttributes(attribute.Bool("generateSAS", shouldGenerateSAS))

		file, fileHeader, err := r.FormFile("file")
		if err != nil {
			log.Printf("error: %v", err)
			span.SetAttributes(attribute.String("status_message", "error"))
			span.RecordError(err)
			http.Error(w, "Error reading file", http.StatusInternalServerError)
			return
		}

		defer file.Close()

		blobContentType := fileHeader.Header.Get("Content-Type")
		blobName := fmt.Sprintf("%s/%s", source, fileHeader.Filename)

		span.SetAttributes(attribute.String("content-type", blobContentType))
		span.SetAttributes(attribute.String("filename", fileHeader.Filename))
		span.SetAttributes(attribute.String("filesize_bytes", strconv.FormatInt(fileHeader.Size, 10)))

		_, err = blobClient.UploadStream(r.Context(), containerName, blobName, file, &azblob.UploadStreamOptions{
			HTTPHeaders: &blob.HTTPHeaders{
				BlobContentType: &blobContentType,
			},
		})

		if err != nil {
			log.Printf("error: %v", err)
			http.Error(w, "Error uploading file to azure blob", http.StatusInternalServerError)
			span.SetAttributes(attribute.String("status_message", "error"))
			span.RecordError(err)
			return
		}

		hostUrl := blobClient.URL()

		u, err := url.Parse(hostUrl)

		if err != nil {
			log.Printf("error: %v", err)
			http.Error(w, "Error uploading file to azure blob", http.StatusInternalServerError)
			span.SetAttributes(attribute.String("status_message", "error"))
			span.RecordError(err)
			return
		}

		urlParts := &azblob.URLParts{
			Host:          u.Host,
			BlobName:      blobName,
			ContainerName: containerName,
			Scheme:        u.Scheme,
		}

		uploadedUrl := urlParts.String()
		if shouldGenerateSAS {
			sasQueryParams, err := sas.BlobSignatureValues{
				Protocol:      sas.ProtocolHTTPS,                    // Users MUST use HTTPS (not HTTP)
				ExpiryTime:    time.Now().UTC().Add(48 * time.Hour), // 48-hours before expiration
				ContainerName: containerName,
				BlobName:      blobName,

				// To produce a container SAS (as opposed to a blob SAS), assign to Permissions using
				// ContainerSASPermissions and make sure the BlobName field is "" (the default).
				Permissions: to.Ptr(sas.BlobPermissions{Read: true, List: true}).String(),
			}.SignWithSharedKey(skCredential)
			if err != nil {
				log.Printf("error: %v", err)
				http.Error(w, "Error generating SAS", http.StatusInternalServerError)
				span.SetAttributes(attribute.String("status_message", "error"))
				span.RecordError(err)
				return
			}
			uploadedUrl = fmt.Sprintf("%s?%s", uploadedUrl, sasQueryParams.Encode())
		}

		span.SetAttributes(attribute.String("uploaded url", uploadedUrl))
		headers := propagation.HeaderCarrier{}
		propagator.Inject(ctx, headers)
		for _, key := range headers.Keys() {
			w.Header().Set(key, headers.Get(key))
		}
		fmt.Fprint(w, uploadedUrl)
	}
}

func deleteHandler(blobClient *azblob.Client, containerName string) http.HandlerFunc {
	return func(w http.ResponseWriter, r *http.Request) {
		if r.Method != "DELETE" {
			http.Error(w, "Method not allowed", http.StatusMethodNotAllowed)
			return
		}
		propagator := otel.GetTextMapPropagator()
		ctx := propagator.Extract(r.Context(), propagation.HeaderCarrier(r.Header))
		_, span := tracing.Tracer.Start(ctx, "delete from az blob")
		defer span.End()

		contentType := r.Header.Get("Content-Type")
		if !strings.Contains(contentType, "application/json") {
			err := fmt.Errorf("content type mismatch. expected application/json | received %s", contentType)
			span.SetAttributes(attribute.String("status_message", "error"))
			span.RecordError(err)
			http.Error(w, err.Error(), http.StatusBadRequest)
			return
		}

		type RequestBody struct {
			Source   string `json:"source"`
			Filename string `json:"filename"`
		}

		var body RequestBody
		err := json.NewDecoder(r.Body).Decode(&body)
		log.Printf("%v", body)
		if err != nil {
			log.Printf("error: %v", err)
			err_ := fmt.Errorf("invalid request body")
			span.SetAttributes(attribute.String("status_message", "error"))
			span.RecordError(err_)
			http.Error(w, err_.Error(), http.StatusBadRequest)
			return
		}

		defer r.Body.Close()

		source := body.Source
		if source == "" {
			err := fmt.Errorf("missing source")
			span.SetAttributes(attribute.String("status_message", "error"))
			span.RecordError(err)
			http.Error(w, err.Error(), http.StatusBadRequest)
			return
		}

		filename := body.Filename
		if filename == "" {
			err := fmt.Errorf("missing filename")
			span.SetAttributes(attribute.String("status_message", "error"))
			span.RecordError(err)
			http.Error(w, err.Error(), http.StatusBadRequest)
			return
		}

		span.SetAttributes(attribute.String("source", source))
		span.SetAttributes(attribute.String("filename", filename))

		_, err = blobClient.DeleteBlob(r.Context(), containerName, fmt.Sprintf("%s/%s", source, filename), &azblob.DeleteBlobOptions{})

		if err != nil {
			log.Printf("error: %v", err)
			http.Error(w, "Error deleting file from azure blob", http.StatusInternalServerError)
			span.SetAttributes(attribute.String("status_message", "error"))
			span.RecordError(err)
			return
		}

		headers := propagation.HeaderCarrier{}
		propagator.Inject(ctx, headers)
		for _, key := range headers.Keys() {
			w.Header().Set(key, headers.Get(key))
		}
		fmt.Fprint(w, true)
	}
}

func generateSAS(blobClient *azblob.Client, skCredential *azblob.SharedKeyCredential, containerName string) http.HandlerFunc {
	return func(w http.ResponseWriter, r *http.Request) {
		if r.Method != "GET" {
			http.Error(w, "Method not allowed", http.StatusMethodNotAllowed)
			return
		}

		// Parse the blob path from the query parameter
		blobPath := r.URL.Query().Get("blobPath")
		if blobPath == "" {
			http.Error(w, "Missing blobPath query parameter", http.StatusBadRequest)
			return
		}

		// Define SAS token expiration time (e.g., 15 minutes)
		expiryTime := time.Now().UTC().Add(15 * time.Minute)

		// Generate the SAS token
		sasQueryParams, err := sas.BlobSignatureValues{
			ContainerName: containerName,
			BlobName:      blobPath,
			ExpiryTime:    expiryTime,
			Permissions:   to.Ptr(sas.BlobPermissions{Read: true, List: true}).String(),
			Protocol:      sas.ProtocolHTTPS, // HTTPS only
		}.SignWithSharedKey(skCredential)

		if err != nil {
			log.Printf("error generating SAS token: %v", err)
			http.Error(w, "Error generating SAS token", http.StatusInternalServerError)
			return
		}
		hostUrl := blobClient.URL()

		// Construct the full SAS URL
		blobURL := fmt.Sprintf("%s/%s/%s?%s", hostUrl, containerName, blobPath, sasQueryParams.Encode())

		// Respond with the SAS URL
		w.Header().Set("Content-Type", "text/plain")
		fmt.Fprint(w, blobURL)
	}
}

func healthHandler(w http.ResponseWriter, r *http.Request) {
	w.WriteHeader(http.StatusOK)
}

func getSharedKeyCredential(connStr string) (*azblob.SharedKeyCredential, error) {
	// we need to extract the account name and account key
	// we can do this by splitting the string on the semicolon
	// and then splitting the resulting strings on the equals sign
	// the first element of the resulting array will be the account name
	// and the second element will be the account key
	connStrParts := strings.Split(connStr, ";")
	config := make(map[string]string)
	for _, part := range connStrParts {
		// find the first index of the equals sign
		firstIndex := strings.Index(part, "=")
		// get the key
		key := part[:firstIndex]
		// get the value
		value := part[firstIndex+1:]
		config[key] = value
	}
	accountName := config["AccountName"]
	accountKey := config["AccountKey"]

	return azblob.NewSharedKeyCredential(accountName, accountKey)
}

func main() {

	if os.Getenv("LOAD_FROM_ENV_FILE") != "0" {
		err := godotenv.Load()
		if err != nil {
			log.Fatalln(err)
		}
	}

	envs := validateAndGetEnvs()

	blobClient, err := azblob.NewClientFromConnectionString(envs["AZ_CONN_STR"].(string), &azblob.ClientOptions{})
	if err != nil {
		log.Fatalf("error: %v", err)
	}
	credential, err := getSharedKeyCredential(envs["AZ_CONN_STR"].(string))
	if err != nil {
		log.Fatalf("error: %v", err)
	}

	// this function returns an error but it need not be handled
	blobClient.CreateContainer(context.Background(), envs["AZ_CONTAINER_NAME"].(string), &container.CreateOptions{
		Access: &azblob.PossiblePublicAccessTypeValues()[1],
	})

	tp, err := tracing.AspectoTraceProvider(envs["ASPECTO_API_KEY"].(string), envs["ENV"].(string), envs["ENABLE_TRACING"].(bool))
	if err != nil {
		log.Fatalf("error: %v", err)
	}
	otel.SetTracerProvider(tp)
	propagator := propagation.NewCompositeTextMapPropagator(propagation.TraceContext{}, propagation.Baggage{})

	otel.SetTextMapPropagator(propagator)

	mux := http.NewServeMux()
	mux.HandleFunc("/upload", authMiddleware(envs["API_KEY"].(string), uploadHandler(blobClient, credential, envs["AZ_CONTAINER_NAME"].(string))))
	mux.HandleFunc("/delete", authMiddleware(envs["API_KEY"].(string), deleteHandler(blobClient, envs["AZ_CONTAINER_NAME"].(string))))
	mux.HandleFunc("/health", healthHandler)
	mux.HandleFunc("/generate-sas-url", authMiddleware(envs["API_KEY"].(string), generateSAS(blobClient, credential, envs["AZ_CONTAINER_NAME"].(string))))

	log.Printf("Listening on :%d", envs["PORT"])
	httpHandler := otelhttp.NewHandler(mux, "uploader-server", otelhttp.WithMessageEvents(otelhttp.ReadEvents, otelhttp.WriteEvents), otelhttp.WithFilter(func(r *http.Request) bool {
		return r.URL.Path != "/health"
	}))
	if err := http.ListenAndServe(fmt.Sprintf(":%d", envs["PORT"]), httpHandler); err != nil {
		log.Fatalln(err)
	}
}
