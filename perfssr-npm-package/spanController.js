const spanController = {};

/**
 * parses spans and extracts necessary data that will be sent back to client/devtool
 * @param {*} span - Array that contains one span object, containing attributes with tracing information
 *
 * Data object to send to client/dashboard
 * - spanType: type of span either fetch or get route path
 * - parentSpanId: id of parent span, shared between Apprender.fetch and next.route
 * - spandId: id of span
 * - traceId: id of trace
 * - parentSpanId: id of parent span, shared between Apprender.fetch and next.route
 * - startTime: start time in unix converted to ms
 * - endTime: end time in unix converted to ms
 * - duration: time it took to run fetch and come back with response in ms
 * - url: original fetch url
 * - httpMethod: http method used (GET, POST, etc)
 */

const parseFetchSpan = (span, clientArr) => {

  const spanObj = span[0];
  const dataObj = {
    spanType: "fetch",
    parentSpanId: spanObj.parentSpanId,
    spanId: spanObj.spanId,
    traceId: spanObj.traceId,
    startTime: spanObj.startTimeUnixNano / Math.pow(10, 6),
    endTime: spanObj.endTimeUnixNano / Math.pow(10, 6),
    duration:(spanObj.endTimeUnixNano - spanObj.startTimeUnixNano) / Math.pow(10, 6)
    ,
    url: spanObj.attributes.find((attr) => attr.key === "http.url")?.value
      ?.stringValue,
    httpMethod: spanObj.attributes.find((attr) => attr.key === "http.method")
      ?.value?.stringValue,
  };

  clientArr.push(dataObj);
};

/**
 * parses spans and extracts necessary data that will be sent back to client/devtool
 * @param {*} span - Array that contains one span object, containing attributes with tracing information
 *
 * Data object for routes
 * - spanType: type of span either fetch or get route path
 * - parentSpanId: id of parent span, shared between Apprender.fetch and next.route, undefined if span type of BaseServer.handleRequest
 * - spandId: id of span
 * - traceId: id of trace
 * - statusCode: http status code; undefined if span type of AppRender.getBodyResult
 * - startTime: start time in unix converted to ms
 * - endTime: end time in unix converted to ms
 * - duration: time it took to run fetch and come back with response in ms
 * - url: original fetch url
 * - httpMethod: http method used (GET, POST, etc)
 */
const parseHandleRequest = (span, clientArr) => {
  const spanObj = span[0];
  const dataObj = {
    spanType: "route",
    parentSpanId: spanObj.parentSpanId,
    spanId: spanObj.spanId,
    traceId: spanObj.traceId,
    statusCode: spanObj.attributes.find(
      (attr) => attr.key === "http.status_code"
    )?.value?.intValue,
    startTime: spanObj.startTimeUnixNano / Math.pow(10, 6),
    endTime: spanObj.endTimeUnixNano / Math.pow(10, 6),
    duration: (spanObj.endTimeUnixNano - spanObj.startTimeUnixNano) / Math.pow(10, 6),
    route: spanObj.attributes.find(
      (attr) => attr.key === "http.target" || attr.key === "next.route"
    )?.value?.stringValue,
  };
  clientArr.push(dataObj);
};

/**
 *
 * @param {*} req - request object
 * @param {*} res  - response object
 * @param {*} next - express next object
 * @returns - call to next middleware
 */

spanController.parseTrace = (req, res, next) => {
  //grab the incoming spans from the request body
  const spans = req.body.resourceSpans[0].scopeSpans[0].spans;

  const spanType = spans[0].attributes.find(
    (attr) => attr.key === "next.span_type"
  )?.value?.stringValue;
  res.locals.clientData = [];

  //handle cases if span type is a route or a fetch
  switch (spanType) {
    case "AppRender.fetch":
      parseFetchSpan(spans, res.locals.clientData);
      break;
    case "BaseServer.handleRequest":
      if (
        spans[0].attributes.find(
          (attr) =>
            attr.key === "http.target" &&
            !attr.value.stringValue.includes("favicon")
        )
      )
        parseHandleRequest(spans, res.locals.clientData);
      break;
    case "AppRender.getBodyResult":
      parseHandleRequest(spans, res.locals.clientData);
      break;
    default:
      return next();
  }

  return next();
};

module.exports = spanController;
