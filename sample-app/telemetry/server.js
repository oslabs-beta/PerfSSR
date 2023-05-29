// module.exports = {
//   startServer: function () {
//express configuration
const express = require("express");
const ws = require("ws");
const app = express();

app.use(express.json());
app.use(express.urlencoded({ extended: true }));

let client = null;
// ws instance
const wss = new ws.Server({ noServer: true });

//controller that handles parsing of span data
const spanController = require("./spanController");

//at root, middleware will parse spans, set parsed data on res.locals.clientData
app.use("/", spanController.parseTrace, (req, res) => {
  if (res.locals.clientData.length > 0 && client !== null) {
    client.send(JSON.stringify(res.locals.clientData));
    // // what to do after a connection is established
    res.sendStatus(200);
  }
});

//server listening on port 4000
const server = app.listen(4000, () => {
  console.log(`Custom trace listening server on port 4000`);
});

// accepts an http server (covered later)

// handle upgrade of the request
server.on("upgrade", function upgrade(request, socket, head) {
  try {
    // authentication and some other steps will come here
    // we can choose whether to upgrade or not

    wss.handleUpgrade(request, socket, head, function done(ws) {
      wss.emit("connection", ws, request);
    });
  } catch (err) {
    console.log("upgrade exception", err);
    socket.write("HTTP/1.1 401 Unauthorized\r\n\r\n");
    socket.destroy();
    return;
  }
});

wss.on("connection", (ctx) => {
  client = ctx;
  // print number of active connections
  console.log("connected", wss.clients.size);

  // handle close event
  ctx.on("close", () => {
    console.log("closed", wss.clients.size);
  });

  // sent a message that we're good to proceed
  // ctx.send("Hi from server");
});
