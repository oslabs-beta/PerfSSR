const otelController = {};

const parseSpan = (clientData, span) => {
  console.log(span);
  span[0].attributes.forEach((attr) => {
    console.log(attr);
  });
  const dataObj = {
    spanId: span.spanId,
    traceId: span.traceId,
    startTime: span.startTimeUnixNano / Math.pow(10, 6),
    endTime: span.endTimeUnixNano / Math.pow(10, 6),
    duration: Math.floor(
      (span.endTimeUnixNano - span.startTimeUnixNano) / Math.pow(10, 6)
    ),
    url: span[0].attributes.find((attr) => attr.key === "http.url")?.value
      ?.stringValue,
    httpMethod: span[0].attributes.find((attr) => attr.key === "http.method")
      ?.value?.stringValue,
  };

  clientData.push(dataObj);
};

otelController.parseTrace = (req, res, next) => {
  const clientData = [];
  //console.log("resource", req.body.resourceSpans[0].resource);
  // req.body.resourceSpans[0].resource.attributes.forEach((atr) => {
  //   console.log(atr);
  // });
  //console.log("scopeSpans", req.body.resourceSpans[0].scopeSpans[0]);
  const spans = req.body.resourceSpans[0].scopeSpans[0].spans;
  //console.log("spans", spans);
  // spans[0].attributes.forEach((attr) => {
  //   console.log(attr);
  // });
  const fetchSpan = spans[0].attributes.find(
    (attr) => attr.key === "next.span_type"
  )?.value?.stringValue;

  if (fetchSpan === "AppRender.fetch") {
    parseSpan(clientData, spans);
  }
  // console.log("client data", clientData);

  res.locals.clientData = clientData;
  return next();
};

module.exports = otelController;
