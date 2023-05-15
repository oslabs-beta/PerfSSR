const connections = {};
let currPort;
const tabStatus = {};
const responseSender = {};
const networkMap = {};

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

    //before request, set tabStatus to loading to track content status
    tabStatus[details.tabId] = 'loading';
  },
  { urls: ["http://localhost:3000/*"] },
  ["extraHeaders", "requestBody"]
);

chrome.webRequest.onSendHeaders.addListener(
  function (details) {
    // console.log("On before send headers", details);
    const { requestId } = details;

    details.requestHeaders.forEach((req) => {
      if (req.name.toLowerCase().includes("rsc")) {
        const networkObj = {
          networkReq: null,
          networkRes: null,
        };
        networkObj.networkReq = details;

        networkMap[requestId] = networkObj;
      }
    });
  },
  { urls: ["http://localhost:3000/*"] },
  ["requestHeaders"]
);

//Event listener connected to console log anytime a network request finishes
chrome.webRequest.onCompleted.addListener(
  function (details) {
    //console.log("Request finished: ", details);
    const { requestId } = details;

    //onComplete, we know request is done so set tabStatus to complete
    tabStatus[details.tabId] = 'complete';

    if (networkMap[requestId]) {
      const matchedObj = networkMap[requestId];
      matchedObj.networkRes = details;
      networkMap[requestId] = matchedObj;
    }

    // console.log("networkmap:", networkMap);
    //send data to dev tools each time we get new item
    sendMessageToDevTool({data: networkMap});
    
  },
  { urls: ["http://localhost:3000/*"] },
  //Add the response headers to the result of the callback
  ["responseHeaders"]
);

const sendMessageToDevTool = (msg) => {
  // console.log("port inside", currPort);
  if (currPort === undefined) {
    console.log("background.js: no port to send message to!");
    return;
  }
  // console.log("background.js sending message to dev tool:", msg);
  chrome.runtime.sendMessage({ message: msg });
};


// Establish connection with dev tool
// will not fire until chrome.runtime.connect is invoked
chrome.runtime.onConnect.addListener((port) => {
  
  currPort = port;
  console.log('connected port', currPort);
  //Listen to messages from dev tool
  const devToolsListener = (message, port) => {
    const injectScript = (file) => {
      try {
        const htmlBody = document.getElementsByTagName("body")[0];
        const script = document.createElement("script");
        script.setAttribute("type", "text/javascript");
        script.setAttribute("src", file);
        htmlBody.appendChild(script);
      } catch (error) {
        console.log("background error:", error.message);
      }
    };

    // inject script
    chrome.scripting
      .executeScript({
        target: { tabId: message.tabId },
        function: injectScript,
        args: [chrome.runtime.getURL("/bundles/backend.bundle.js")],
        injectImmediately: true,
      })

    console.log("msg received from dev tool: ", message);
    console.log("port ", port);
    if (message.name === "init" && message.tabId) {
      console.log("tabID from devtol", message.tabId);
      connections[message.tabId] = port;
      connections[message.tabId].postMessage("Connected!");
    }
    console.log("connections: ", connections);
  };

  // Listen to messages sent from the DevTools page
  port.onMessage.addListener(devToolsListener);

  // //Send a message from background.js to dev tool
  // currPort = port; //need to set currPort to current port being listened
  // sendMessageToDevTool(networkMap);

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
  // console.log("msg received from contentScript: ", message);
  // console.log("sender: ", sender);

  // send metrics received from contentScript.js to devtools.js
  if (message.metricName && message.value) {
    chrome.runtime.sendMessage({
      metricName: message.metricName,
      value: message.value,
    });
  }

  // console.log('message', message);
  // //send networkMap when requested elsewhere
  // if (message.getInfo) {
  //   if (tabStatus[sender.tab.id] === 'complete') {
  //     sendResponse({data: 'sending complete data from bg to devtools'});
  //   }
  // } else {
  //   //send later, set the function to send back response to tab id as key
  //   responseSender[sender.tab.id] = sendResponse;
  //   console.log("responseSender", sender.tab.id);
  //   return true; //to indicate we are sending later
  // }

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
