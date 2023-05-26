//Open telemetry stuff
const {
  ConsoleSpanExporter,
  NodeTracerProvider,
  SimpleSpanProcessor,
} = require("@opentelemetry/sdk-trace-node");
const { registerInstrumentations } = require("@opentelemetry/instrumentation");

const { HttpInstrumentation } = require("@opentelemetry/instrumentation-http");
const {
  OTLPTraceExporter,
} = require("@opentelemetry/exporter-trace-otlp-http");

const provider = new NodeTracerProvider();

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

const traceExporter = new OTLPTraceExporter({
  url: "http://localhost:3300",
});

provider.addSpanProcessor(new SimpleSpanProcessor(traceExporter));
provider.register();

//Express stuff
const express = require("express");
const http = require("http");
const socket = require("socket.io");
const app = express();
const otelController = require("./otelController");
const PORT = "3001";

const server = http.Server(app);
server.listen(3001);

const io = socket(server);

app.use(express.json());
app.use(express.urlencoded({ extended: true }));

app.use("/", otelController.parseTrace, (req, res) => {
  console.log(res.locals.clientData);
  if (res.locals.clientData.length > 0)
    io.emit("message", JSON.stringify(res.locals.clientData));
  res.status(200);
});

// const io = require("socket.io")(server, {
//   cors: {
//     origin: "http://localhost:3000",
//     credentials: true,
//   },
// });

// const io = new Server(httpServer, {
//   cors: {
//     origin: "http://localhost:3000",
//     credentials: true,
//   },
// });

// app.get("/:stream", function (req, res) {
//   res.send("stream");
// });

io.on("connection", (socket) => {
  //console.log("socket", socket);
  socket.emit("connection-established", "Connected");
  socket.on("greeting-from-client", (msg) => {
    console.log(message);
  });
});

// httpServer.listen(3001);

// const server = app.listen(PORT, () => {
//     console.log(`Server is running on port ${PORT}`);
//   });
