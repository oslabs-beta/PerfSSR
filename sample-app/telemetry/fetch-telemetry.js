//start monitoring
module.exports = {
  startOtel: function () {
    const serverPort = 4000;
    const { startServer } = require("./server");
    //open telemetry packages
    const {
      NodeTracerProvider,
      SimpleSpanProcessor,
    } = require("@opentelemetry/sdk-trace-node");
    const {
      registerInstrumentations,
    } = require("@opentelemetry/instrumentation");
    const {
      HttpInstrumentation,
    } = require("@opentelemetry/instrumentation-http");
    const {
      OTLPTraceExporter,
    } = require("@opentelemetry/exporter-trace-otlp-http");

    // --- OPEN TELEMETRY SETUP --- //

    const provider = new NodeTracerProvider();

    //register instruments
    //inject custom custom attributes for package size and instrumentation library used
    //for use in otleController middlware
    registerInstrumentations({
      instrumentations: [
        new HttpInstrumentation({
          responseHook: (span, res) => {
            span.setAttribute(
              "instrumentationLibrary",
              span.instrumentationLibrary.name
            );

            // Get the length of the 8-bit byte array. Size indicated the number of bytes of data
            let size = 0;
            res.on("data", (chunk) => {
              size += chunk.length;
            });

            res.on("end", () => {
              span.setAttribute("contentLength", size);
            });
          },
        }),
      ],
    });

    //export traces to custom express server running on port 4000
    const traceExporter = new OTLPTraceExporter({
      url: `http://localhost:${serverPort}`, //export traces as http req to custom express server on port 400
    });

    //add exporter to provider / register provider
    provider.addSpanProcessor(new SimpleSpanProcessor(traceExporter));
    provider.register();

    startServer();
  },
};
