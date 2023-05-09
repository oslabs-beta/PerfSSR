const connections = {};


// Establish connection with dev tool
// will not fire until chrome.runtime.connect is invoked
chrome.runtime.onConnect.addListener((port) => {
    const devToolsListener = (message, port) => {
        console.log('msg received from dev tool: ', message)
        console.log('port ', port)
        if (message.name === "init" && message.tabId) {
            connections[message.tabId] = port;
            connections[message.tabId].postMessage("Connected!");
          }
        console.log("connections: ", connections);
    }
    // Listen to messages sent from the DevTools page
    port.onMessage.addListener(devToolsListener);

    // Disconnect 
    port.onDisconnect.addListener((port) => {
        port.onMessage.removeListener(devToolsListener);

        // Removes reference to dev tool instance when the dev tool is closed
        for (const key in connections){
            if (connections[key] === port){
            delete connections[key];
            break;
            }
        }
        })
});


// Listener for message from contentScript.js
chrome.runtime.onMessage.addListener((message, sender, sendResponse) => {
  console.log('msg received from contentScript: ', message)
  console.log('sender: ', sender)

  // send metrics to devtools.js
  if (message.metricName && message.value) {
    chrome.runtime.sendMessage({
      metricName: message.metricName,
      value: message.value
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
})