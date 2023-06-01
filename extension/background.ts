import { FiberMsg } from './contentScript';

interface Connection {
    postMessage: (msg: any) => void;
}
  
const connections : {[tabId: number]: Connection} = {};
let currPort: chrome.runtime.Port | undefined;;
const tabStatus: {[tabId: number]: string}= {};
const responseSender = {};
const messageQueue: FiberMsg[] = [];


const sendMessageToDevTool = (msg: {}) => {
  if (currPort === undefined) {
    return;
  }
  chrome.runtime.sendMessage({ message: msg });
};

//this listener will fire on connection with devtool
chrome.runtime.onConnect.addListener((port) => {
  currPort = port;
  //Listen to messages from dev tool
  const devToolsListener = (message: any, port: chrome.runtime.Port) => {
    // inject script
    chrome.scripting.executeScript({
      target: { tabId: message.tabId },
      func: injectScript,
      args: [chrome.runtime.getURL("/bundles/backend.bundle.js")],
      injectImmediately: true,
    });

    // check if established initial connection with dev tool
    if (message.name === "init" && message.tabId) {
      connections[message.tabId] = port;
      connections[message.tabId].postMessage("Connected!");
    }
  };

  // Listen to messages sent from the DevTools page
  port.onMessage.addListener(devToolsListener);

  // Disconnect event listener
  port.onDisconnect.addListener((port) => {
    port.onMessage.removeListener(devToolsListener);

    // on disconnect, will remove reference to dev tool instance 
    for (const key in connections) {
      if (connections[key] === port) {
        delete connections[key];
        break;
      }
    }
  });
});

// Listener for messages from contentScript.ts
chrome.runtime.onMessage.addListener((message, sender, sendResponse) => {
  //Send fiber instance to App.js of devtool
  if (message.type === "UPDATED_FIBER" || message.type === "FIBER_INSTANCE") {
    chrome.runtime.sendMessage(message);
    // Add the fiber tree to the queue so App.js can retieve the fiber tree message 
    // after the app / frontend is rendered
    // without the queue, fiber tree will be received and lost before the frontend renders  
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

//event listener for on page refresh
chrome.tabs.onUpdated.addListener((tabId, changeInfo, tab) => {
  if (changeInfo.status === "complete") {

    //script will be injected on page refresh/load
    chrome.scripting.executeScript({
      target: { tabId: tabId },
      func: injectScript,
      args: [chrome.runtime.getURL("/bundles/backend.bundle.js")],
      injectImmediately: true,
    });

    // Send a message to the contentScript that new performance data is needed
    //chrome.tabs.sendMessage(tabId, {message: "TabUpdated"});
  }
});


//Inject script to grab RDT instance when the app is running
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