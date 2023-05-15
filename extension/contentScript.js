console.log("contentScript.js is running");

// Send message to background.js / devtools.js
const sendMsgToBackground = (msg) => {
  chrome.runtime.sendMessage(msg);
};

// Listener for messages from background.js
chrome.runtime.onMessage.addListener((msg) => {
  console.log("printing msg received from background.js: ", msg);
});

//Listener for messages from the window
// window.addEventListener("message", (e) => {
//   console.log("printing msg received from the window: ", e);
// });

//This listener only cares if the window is passing an instance of the fiber tree
window.addEventListener("message", (msg) => {
  if (msg.data.type === "FIBER_INSTANCE") {
    // console.log(msg.data);
    const bgMsg = {
      type: "FIBER_INSTANCE",
      payload: msg.data.payload,
    };
    sendMsgToBackground(bgMsg);
  }
});

// document.addEventListener("click", (event) => {
//     sendMsgToBackground({
//         click: true,
//         xPosition: event.clientX + document.body.scrollLeft,
//         yPosition: event.clientY + document.body.scrollTop
//       });
//   });

// send metrics data to background.js
function sendMetric(metric) {
  sendMsgToBackground({
    metricName: metric.name,
    value: metric.value,
  });
}

const po = new PerformanceObserver((entryList) => {
  for (const entry of entryList.getEntries()) {
    console.log(entry.entryType, entry.name, entry.startTime);
    if (
      entry.entryType === "paint" &&
      entry.name === "first-contentful-paint"
    ) {
      sendMetric({ name: "FCP", value: entry.startTime });
    }
    if (entry.entryType === "largest-contentful-paint") {
      sendMetric({ name: "LCP", value: entry.startTime });
    }
    if (entry.entryType === "layout-shift") {
      sendMetric({ name: "CLS", value: entry.value });
    }
    if (entry.entryType === "longtask") {
      const tbt = entry.duration - 50; // TBT formula\
      sendMetric({ name: "TBT", value: tbt });
    }
    if (entry.entryType === "first-input") {
      sendMetric({
        name: "FID",
        value: entry.processingStart - entry.startTime,
      });
    }
  }
});

po.observe({ type: "paint", buffered: true });
po.observe({ type: "largest-contentful-paint", buffered: true });
po.observe({ type: "layout-shift", buffered: true });
po.observe({ type: "longtask", buffered: true });
po.observe({ type: "first-input", buffered: true });
