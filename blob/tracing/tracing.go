package tracing

import (
	"context"
	"time"

	"go.opentelemetry.io/otel"
	"go.opentelemetry.io/otel/exporters/otlp/otlptrace/otlptracehttp"
	"go.opentelemetry.io/otel/sdk/resource"
	sdktrace "go.opentelemetry.io/otel/sdk/trace"
	semconv "go.opentelemetry.io/otel/semconv/v1.4.0"
)

var Tracer = otel.Tracer("blob")

func AspectoTraceProvider(aspectoAPIKey string, env string, enable bool) (*sdktrace.TracerProvider, error) {
	ctx := context.Background()
	traceExporter, err := otlptracehttp.New(ctx,
		otlptracehttp.WithEndpoint("otelcol.aspecto.io"),
		otlptracehttp.WithHeaders(map[string]string{"Authorization": aspectoAPIKey}))
	if err != nil {
		return nil, err
	}

	opts := []sdktrace.TracerProviderOption{}

	if enable {
		opts = append(opts, sdktrace.WithSampler(sdktrace.ParentBased(sdktrace.TraceIDRatioBased(1))))
	} else {
		opts = append(opts, sdktrace.WithSampler(sdktrace.NeverSample()))
	}

	opts = append(opts, sdktrace.WithBatcher(traceExporter))
	opts = append(opts, sdktrace.WithResource(resource.NewWithAttributes(
		semconv.SchemaURL,
		semconv.ServiceNameKey.String("blob"),
		semconv.DeploymentEnvironmentKey.String(env),
	)))

	tp := sdktrace.NewTracerProvider(opts...)
	// tp.RegisterSpanProcessor(sdktrace.NewSimpleSpanProcessor(traceExporter))
	tp.RegisterSpanProcessor(sdktrace.NewBatchSpanProcessor(traceExporter, sdktrace.WithBatchTimeout(10*time.Second)))
	return tp, nil
}
