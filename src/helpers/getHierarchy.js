const dummyArr = [
    {
    spanType: 'route',
    parentSpanId: 'e94a35126bc628a7',
    spanId: 'd3d21a36ebb9d27b',
    traceId: '92c68a2039c9cd81cd6d24cc059159e2',
    statusCode: undefined,
    startTime: 1685340467733,
    endTime: 1685340467743.0198,
    duration: 10,
    route: '/'
  },
  {
    spanType: 'route',
    parentSpanId: undefined,
    spanId: 'e94a35126bc628a7',
    traceId: '92c68a2039c9cd81cd6d24cc059159e2',
    statusCode: 200,
    startTime: 1685340467718.0002,
    endTime: 1685340467750.4998,
    duration: 32,
    route: '/'
  },
]

function getHierarchy(spanArr) {
  const hierarchy = {
    parentSpans: [],
    relationship: [],
  };

  for (let obj of spanArr) {
    //if parentSpanId is undefined, it's a parent span
    if (!obj[parentSpanId]) {
        hierarchy['parentSpans'] = obj;
    } else {
        //check if parentSpanId of child span exists in hierarchy obj
        //if so push child span 
    }
  }
}