// --- EXPRESS SERVER / SOCKET SETUP --- //

// module.exports = {
//   startServer: function () {
//express configuration
const express = require("express");
const app = express();
const { createServer } = require("http");
//const httpServer = require("http").createServer(app);
//const { Server } = require("socket.io");
const httpServer = createServer(app);

app.use(express.json());
app.use(express.urlencoded({ extended: true }));

const otelController = require("./otelController"); //import middleware

// const io = new Server(httpServer, {
//   cors: {
//     origin: `*`,
//     credentials: true,
//   },
// });

// const io = require("socket.io")(httpServer, {
//   cors: {
//     origin: `*`,
//     credentials: true,
//   },
// });

//custom express server running on port 4000 to send data to front end dashboard
app.use("/", otelController.parseTrace, (req, res) => {
  if (res.locals.clientData.length > 0)
    //   //io.emit("message", JSON.stringify(res.locals.clientData));

    res.sendStatus(200);
});

//start custom express server on port 4000
httpServer.listen(4000, () => {
  console.log(`Custom trace listening server on port 4000`);
});
//   .on("error", function (err) {
//     process.once("SIGUSR2", function () {
//       process.kill(process.pid, "SIGUSR2");
//     });
//     process.on("SIGINT", function () {
//       // this is only called on ctrl+c, not restart
//       process.kill(process.pid, "SIGINT");
//     });
//   });

//create socket running on top of express server + enable cors
// const io = require("socket.io")(httpServer, {
//   cors: {
//     origin: `*`,
//     credentials: true,
//   },
// });
//   },
// };
