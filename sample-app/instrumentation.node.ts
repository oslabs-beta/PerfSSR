import { NodeSDK } from "@opentelemetry/sdk-node";
import { OTLPTraceExporter } from "@opentelemetry/exporter-trace-otlp-http";
import { Resource } from "@opentelemetry/resources";
import { SemanticResourceAttributes } from "@opentelemetry/semantic-conventions";
import { SimpleSpanProcessor } from "@opentelemetry/sdk-trace-node";

const sdk = new NodeSDK({
  resource: new Resource({
    [SemanticResourceAttributes.SERVICE_NAME]: "next-app",
  }),
  spanProcessor: new SimpleSpanProcessor(
    new OTLPTraceExporter({
      url: `http://localhost:4000`, //export traces as http req to custom express server on port 400
    })
  ),
});
sdk.start();
