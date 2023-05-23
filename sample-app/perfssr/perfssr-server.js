const http = require("http");
const perfssr = require('../fetch-timer.js');
const { install } = perfssr;
install(handleFetch);


function handleFetch(data) {
    console.log("handleFetch", data);
    perfSSRData3 = data;
}

let perfSSRData3 = {};

// replace this with websocket if you want to have a continuous line of communication
const perfssrServer = http.createServer((req, res) => {
    const { rawHeaders, method, url, socket } = req;
    const { remoteAddress, remoteFamily } = socket;


    console.log(
        JSON.stringify({
          timestamp: Date.now(),
          rawHeaders,
          method,
          remoteAddress,
          remoteFamily,
          url
        })
      );
      res.setHeader('Access-Control-Allow-Origin', '*'); /* @dev First, read about security */
      res.setHeader('Access-Control-Allow-Methods', 'OPTIONS, GET');
      res.setHeader('Access-Control-Max-Age', 2592000); // 30 days
    res.setHeader('Content-Type', 'application/json');
    console.log("data", perfssr);
    console.log("globalthis", globalThis);
    console.log("callback data", perfSSRData3);
    res.end(JSON.stringify(perfssr.perfSSRData2));
});

const PORT = 5055;

perfssrServer.listen(PORT, () => {
    console.log(`perfSSR server listening on ${PORT}`);

    // give fetch timer a callback function that lets it send a message to the client
});