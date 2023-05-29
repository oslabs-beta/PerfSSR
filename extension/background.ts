import { FiberMsg } from './contentScript';

interface Connection {
    postMessage: (msg: any) => void;
}
  
interface NetworkObj {
    networkReq: chrome.webRequest.WebRequestHeadersDetails | null;
    networkRes: chrome.webRequest.WebResponseCacheDetails | null;
}

const connections : {[tabId: number]: Connection} = {};
let currPort: chrome.runtime.Port | undefined;;
const tabStatus: {[tabId: number]: string}= {};
const responseSender = {};
const networkMap: {[requestId: string]: NetworkObj} = {};
const messageQueue: FiberMsg[] = [];

// Event listener connected to console log anytime a network request starts
chrome.webRequest.onBeforeRequest.addListener(
  function (details: chrome.webRequest.WebRequestBodyDetails) {
    // Before request, set tabStatus to loading to track content status
    tabStatus[details.tabId] = "loading";
  },
  { urls: ["http://localhost:3000/*"] },
  ["extraHeaders", "requestBody"]
);

chrome.webRequest.onSendHeaders.addListener(
  function (details: chrome.webRequest.WebRequestHeadersDetails) {
    // console.log("On before send headers", details);
    const { requestId } = details;

    details.requestHeaders.forEach((req) => {
      if (req.name.toLowerCase().includes("rsc")) {
        const networkObj:  NetworkObj = {
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
  function (details: chrome.webRequest.WebResponseCacheDetails) {
    //console.log("Request finished: ", details);
    const { requestId } = details;

    //onComplete, we know request is done so set tabStatus to complete
    tabStatus[details.tabId] = "complete";

    if (networkMap[requestId]) {
      const matchedObj = networkMap[requestId];
      matchedObj.networkRes = details;
      networkMap[requestId] = matchedObj;
    }

    // console.log("networkmap:", networkMap);
    //send data to dev tools each time we get new item
    sendMessageToDevTool({ data: networkMap });
  },
  { urls: ["http://localhost:3000/*"] },
  //Add the response headers to the result of the callback
  ["responseHeaders"]
);

const sendMessageToDevTool = (msg: {}) => {
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
  console.log("connected port", currPort);
  //Listen to messages from dev tool
  const devToolsListener = (message: any, port: chrome.runtime.Port) => {
    // inject script
    chrome.scripting.executeScript({
      target: { tabId: message.tabId },
      func: injectScript,
      args: [chrome.runtime.getURL("/bundles/backend.bundle.js")],
      injectImmediately: true,
    });

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
  //Send fiber instance to devtool.js
  if (message.type === "UPDATED_FIBER" || message.type === "FIBER_INSTANCE") {
    console.log(message);
    console.log(`Sending ${message.type} message to App.js:`, message);
    chrome.runtime.sendMessage(message);
    // Add the message to the queue
    messageQueue.push(message);
  }

  if (message.type === "GET_MESSAGE_FROM_QUEUE") {
    const message = messageQueue.shift(); // Retrieve the first message from the queue
    sendResponse(message); // Send the message back to the component
  }

  // send metrics received from contentScript.js to devtools.js
  if (message.metricName && message.value) {
    chrome.runtime.sendMessage({
      metricName: message.metricName,
      value: message.value,
    });
  }
});

chrome.tabs.onUpdated.addListener((tabId, changeInfo, tab) => {
  if (changeInfo.status === "complete") {

    for (let variableKey in networkMap) {
      if (networkMap.hasOwnProperty(variableKey)) {
        delete networkMap[variableKey];
      }
    }
    sendMessageToDevTool({ data: networkMap });
    // Do something when the tab has been reloaded

    // Send a message to the contentScript that new performance data is needed
    chrome.tabs.sendMessage(tabId, {message: "TabUpdated"});
  }
});

const injectScript = (file: string): void => {
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