FROM golang:1.20.1

WORKDIR /app

COPY go.mod .
COPY go.sum .

RUN go mod download

COPY . .

RUN CGO_ENABLED=0 GOOS=linux GOARCH=amd64 go build -o build/blob .

EXPOSE 4000

CMD [ "/app/build/blob" ]
