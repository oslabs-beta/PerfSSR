chrome.devtools.panels.create(
    "PerfSSR",
    null, // to add logo later
    "panel.html"
  );

// Create a connection to the background service worker
const backgroundPageConnection = chrome.runtime.connect();

// Relay the tab ID to the background service worker
backgroundPageConnection.postMessage({
  name: "init",
  tabId: chrome.devtools.inspectedWindow.tabId,
});