import { NodeSDK } from "@opentelemetry/sdk-node";
import { OTLPTraceExporter } from "@opentelemetry/exporter-trace-otlp-http";
import { Resource } from "@opentelemetry/resources";
import { SemanticResourceAttributes } from "@opentelemetry/semantic-conventions";
import { SimpleSpanProcessor } from "@opentelemetry/sdk-trace-node";

const sdk = new NodeSDK({
  //entity producing resource attributes
  //next already as otel built in, we are listening to their built-in instrumentation
  resource: new Resource({
    [SemanticResourceAttributes.SERVICE_NAME]: "next-app",
  }),
  //bundles all trace data into span objects
  spanProcessor: new SimpleSpanProcessor(
    new OTLPTraceExporter({
      //all traces exported to express server on port 4000
      url: `http://localhost:4000`,
    })
  ),
});

//start tracing
sdk.start();
