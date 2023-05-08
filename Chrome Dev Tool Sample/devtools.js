let youClickedOn;
chrome.devtools.panels.create("PerfSSR",
                              null,  // to add logo later
                              "panel.html",
                              panel => {
    panel.onShown.addListener( (extPanelWindow) => {
        let sayHello = extPanelWindow.document.querySelector('#sayHello');
        youClickedOn = extPanelWindow.document.querySelector('#youClickedOn');
        sayHello.addEventListener("click", () => {
            chrome.devtools.inspectedWindow.eval('alert("Hello from the DevTools extension");')
        })
    })                              
                              });

// listen to background.js
chrome.runtime.onMessage.addListener((message, sender, sendResponse) => {
    if (message.xPosition && message.yPosition) {
        if (youClickedOn) {
            youClickedOn.innerHTML = `You clicked on position (${message.xPosition}, ${message.yPosition}) in the inspected page.`;
        }
    }
});


// Create a connection to the background service worker
const backgroundPageConnection = chrome.runtime.connect();
                            
// Relay the tab ID to the background service worker
backgroundPageConnection.postMessage({
    name: 'init',
    tabId: chrome.devtools.inspectedWindow.tabId
});