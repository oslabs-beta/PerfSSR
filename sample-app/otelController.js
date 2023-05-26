const otelController = {};

//helper function - identifies strings with substrings that match array elements
const includesAny = (array, string) => {
  for (let i = 0; i < array.length; i++) {
    if (string.includes(array[i])) return true;
  }
  return false;
};

//middleware to handle parsing HTTP requests
const parseHTTP = (clientData, spans) => {
  const ignoreEndpoints = ["localhost", "socket", "nextjs"]; //endpoints to ignore

  //add specific span data to clientData array through deconstruction of span elements
  //spans is an array of span objects
  //attributes is an array of nested object with one key-value pair per array element
  //ex: attributes = [{key: 'http.url', value: {stringValue: 'wwww.api.com/'}}...]
  //el.attributes.find finds the array element with a matching key desired and returns the unnested value if
  //exists or null if doesn't exist
  spans.forEach((el) => {
    const clientObj = {
      spanId: el.spanId,
      traceId: el.traceId,
      startTime: Math.floor(el.startTimeUnixNano / Math.pow(10, 6)), //[ms]
      duration: Math.floor(
        (el.endTimeUnixNano - el.startTimeUnixNano) / Math.pow(10, 6)
      ), //[ms]
      contentLength: (() => {
        const packageObj = el.attributes.find(
          (attr) => attr.key === "contentLength"
        );
        const size = packageObj ? packageObj.value.intValue : 0;
        return size;
      })(),
      statusCode: el.attributes.find((attr) => attr.key === "http.status_code")
        ?.value?.intValue,
      endPoint: el.attributes.find((attr) => attr.key === "http.url")?.value
        ?.stringValue,
      requestMethod: el.name,
      requestType: "HTTPS",
    };


  });
  return clientData;
};

otelController.parseTrace = (req, res, next) => {
  let clientData = [];
  const spans = req.body.resourceSpans[0].scopeSpans[0].spans;
  //console.log("spans", spans);
  const instrumentationLibrary = spans[0].attributes.find(
    (attr) => attr.key === "instrumentationLibrary"
  )?.value?.stringValue;

  //console.log("instrumentationLibrary", instrumentationLibrary);

  //invoke different middleware function based on instrument used to collect incoming trace
  //middleware functions will deconstruct request body and built out clientData array

  if (instrumentationLibrary === "@opentelemetry/instrumentation-http")
    clientData = parseHTTP(clientData, spans);

  //console.log("client data", clientData);

  res.locals.clientData = clientData;
  return next();
};

module.exports = otelController;
