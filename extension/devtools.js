// let youClickedOn;
chrome.devtools.panels.create(
  "PerfSSR",
  null, // to add logo later
  "panel.html"
  //                           panel => {
  // panel.onShown.addListener( (extPanelWindow) => {
  //     let sayHello = extPanelWindow.document.querySelector('#sayHello');
  //     youClickedOn = extPanelWindow.document.querySelector('#youClickedOn');
  //     sayHello.addEventListener("click", () => {
  //         chrome.devtools.inspectedWindow.eval('alert("Hello from the DevTools extension");')
  //     })
  // })
  //}
);


// listen to background.js / contentScript.js
chrome.runtime.onMessage.addListener((message, sender, sendResponse) => {

  // send metrics data to App.js
  if (message.metricName && message.value) {
    window.postMessage(
      {
        type: "metrics",
        metricName: message.metricName,
        value: message.value
        }, '*');
    }

    //if we get a message from background.js with the data
    //send to App.js
    if (message.data) {
        console.log("data!!!: ", message.data)
        window.postMessage({
        type: 'componentMetrics',
        data: message.data,
        }, '*');
    }
});

// Create a connection to the background service worker
const backgroundPageConnection = chrome.runtime.connect();

// Relay the tab ID to the background service worker
backgroundPageConnection.postMessage({
  name: "init",
  tabId: chrome.devtools.inspectedWindow.tabId,
  //scriptToInject: "contentScript.js"
});

// Inject contentScript.js into the inspected page
// chrome.devtools.inspectedWindow.eval(`fetch(chrome.runtime.getURL('contentScript.js'))
//   .then(response => response.text())
//   .then(code => eval(code))
//   .catch(e => console.error(e))`);
