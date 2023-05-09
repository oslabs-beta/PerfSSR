// let youClickedOn;
chrome.devtools.panels.create("PerfSSR",
                              null,  // to add logo later
                              "panel.html",
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
    console.log("messaged received in devtools.js: ", message)
    // if (message.xPosition && message.yPosition) {
    //     if (youClickedOn) {
    //         youClickedOn.innerHTML = `You clicked on position (${message.xPosition}, ${message.yPosition}) in the inspected page.`;
    //     }
    // }

    // send metrics data to App.js
    if (message.metricName && message.value) {
        window.postMessage({
        type: 'metrics',
        metricName: message.metricName,
        value: message.value
        }, '*');
    }
    // if (message.metricName === 'FCP') {
    //   // Display FCP value
    //   console.log('FCP:', message.value);
    //   let fcpElement = document.getElementById("fcp");
    //   if (fcpElement) {
    //     fcpElement.innerText = message.value;
    //   }
    // }
    // if (message.metricName === 'LCP') {
    //   // Display LCP value
    //   console.log('LCP:', message.value);
    //   let lcpElement = document.getElementById("lcp");
    //   if (lcpElement) {
    //     lcpElement.innerText = message.value;
    //   }
    // }
    // if (message.metricName === 'CLS') {
    //     // Display CLS value
    //     console.log('CLS:', message.value);
    //     let clsElement = document.getElementById("cls");
    //     if (clsElement) {
    //         clsElement.innerText = message.value;
    //     }
    // }
    // if (message.metricName === 'TBT') {
    //     // Display TBT value
    //     console.log('TBT:', message.value);
    //     let tbtElement = document.getElementById("tbt");
    //     if (tbtElement) {
    //         tbtElement.innerText = message.value;
    //     }
    // }
    // if (message.metricName === 'FID') {
    //     // Display FID value
    //     console.log('FID:', message.value);
    //     let fidElement = document.getElementById("fid");
    //     if (fidElement) {
    //         fidElement.innerText = message.value;
    //     }
    // }
//   }
});


// Create a connection to the background service worker
const backgroundPageConnection = chrome.runtime.connect();
                            
// Relay the tab ID to the background service worker
backgroundPageConnection.postMessage({
    name: 'init',
    tabId: chrome.devtools.inspectedWindow.tabId,
    //scriptToInject: "contentScript.js"
});


// Inject contentScript.js into the inspected page
// chrome.devtools.inspectedWindow.eval(`fetch(chrome.runtime.getURL('contentScript.js'))
//   .then(response => response.text())
//   .then(code => eval(code))
//   .catch(e => console.error(e))`);