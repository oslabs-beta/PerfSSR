const connections = {};
let currPort;
const networkMap = new Map();

/*
Info neded from network request/response


Request Started:
---------------
- Document ID?
- requestID - logs the ID for that particular component network request
- tabID - the ID that the app is living on (may not need this?)
- timeStamp - Start time for when the network request is fired
- Url - refines our search for only component based files / urls

Request Completed:
---------------
- Document ID
- requestID
- timeStamp (to get the request end time)
- responseHeaders -> get the vary key to check if it contains 'RSC'
- url (url being requested)

*/

//Event listener connected to console log anytime a network request starts
chrome.webRequest.onBeforeRequest.addListener(
  function (details) {
    // Request started, capture start time
    //console.log("Request started: ", details);
  },
  { urls: ["http://localhost:3000/*"] },
  ["extraHeaders", "requestBody"]
);

chrome.webRequest.onSendHeaders.addListener(
  function (details) {
    console.log("On before send headers", details);
    const { requestId } = details;

    console.log(details);

    details.requestHeaders.forEach((req) => {
      if (req.name.toLowerCase().includes("rsc")) {
        const networkObj = {
          networkReq: null,
          networkRes: null,
        };
        networkObj.networkReq = details;

        networkMap.set(requestId, networkObj);
      }
    });

    // const networkObj = {
    //   networkReq: null,
    //   networkRes: null,
    // };
    // networkObj.networkReq = details;

    // networkMap.set(requestId, networkObj);
  },
  { urls: ["http://localhost:3000/*"] },
  ["requestHeaders"]
);

//Event listener connected to console log anytime a network request finishes
chrome.webRequest.onCompleted.addListener(
  function (details) {
    //console.log("Request finished: ", details);
    const { requestId } = details;

    //console.log(requestId);

    if (networkMap.has(requestId)) {
      const matchedObj = networkMap.get(requestId);
      matchedObj.networkRes = details;
      networkMap.set(requestId, matchedObj);
    }

    console.log("networkmap:", networkMap);
  },
  { urls: ["http://localhost:3000/*"] },
  //Add the response headers to the result of the callback
  ["responseHeaders"]
);

const sendMessageToDevTool = (msg) => {
  if (currPort === undefined) {
    console.log("background.js: no port to send message to!");
    return;
  }
  console.log("background.js sending message to dev tool:", msg);
  chrome.runtime.sendMessage({ message: msg });
};

// Establish connection with dev tool
// will not fire until chrome.runtime.connect is invoked
chrome.runtime.onConnect.addListener((port) => {
  //Listen to messages from dev tool
  const devToolsListener = (message, port) => {
    console.log("msg received from dev tool: ", message);
    console.log("port ", port);
    if (message.name === "init" && message.tabId) {
      connections[message.tabId] = port;
      connections[message.tabId].postMessage("Connected!");
    }
    console.log("connections: ", connections);
  };
  // Listen to messages sent from the DevTools page
  port.onMessage.addListener(devToolsListener);

  //Send a message from background.js to dev tool
  currPort = port; //need to set currPort to current port being listened
  sendMessageToDevTool("hello from bg.js");

  // Disconnect
  port.onDisconnect.addListener((port) => {
    port.onMessage.removeListener(devToolsListener);

    // Removes reference to dev tool instance when the dev tool is closed
    for (const key in connections) {
      if (connections[key] === port) {
        delete connections[key];
        break;
      }
    }
  });
});

// Listener for messages from contentScript.js
chrome.runtime.onMessage.addListener((message, sender, sendResponse) => {
  console.log("msg received from contentScript: ", message);
  console.log("sender: ", sender);

  // send metrics received from contentScript.js to devtools.js
  if (message.metricName && message.value) {
    chrome.runtime.sendMessage({
      metricName: message.metricName,
      value: message.value,
    });
  }

  if (sender.tab) {
    // if (message.click === true) {
    //     console.log('I am here!');
    //     const response = {
    //         xPosition: message.xPosition,
    //         yPosition: message.yPosition
    //     };
    //     // Check if the tab has a connection established
    //     if (connections[sender.tab.id]) {
    //       // Send the response to the DevTools script
    //       connections[sender.tab.id].postMessage(response);
    //   }
    // }
    // Send message to corresponding dev tool instance
    // let tabId = `${sender.tab.id}`;
    // if (tabId in connections) connections[tabId].postMessage(message);
    // else {
    //   // Tells content script that connection was not made
    //   sendResponse({
    //     error: 'error',
    //   });
    //   console.log(`Tab, ${tabId}, not found in connection list: `, connections);
    // }
  }
});
