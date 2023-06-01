export interface FiberMsg {
    type: string;
    payload: string;  
}

interface MetricMsg {
    metricName: string;
    value: number; 
}

interface Metric {
  name: string;
  value: number;
}

// Send message to background.js
const sendMsgToBackground = (msg: MetricMsg | FiberMsg) => {
  chrome.runtime.sendMessage(msg);
};

//This listener only cares if the window is passing an instance of the fiber tree
window.addEventListener("message", (msg) => {
  if (msg.data.type === "FIBER_INSTANCE" || msg.data.type === "UPDATED_FIBER") {
    const bgMsg: FiberMsg = {
      type: msg.data.type,
      payload: msg.data.payload,
    };
    sendMsgToBackground(bgMsg);
  }
});

// send metrics data to background.js
function sendMetric(metric: Metric): void {
  sendMsgToBackground({
    metricName: metric.name,
    value: metric.value,
  });
}

let po: PerformanceObserver;

interface LayoutShiftEntry extends PerformanceEntry {
    entryType: 'layout-shift';
    value: number;
}

  interface FirstInputEntry extends PerformanceEntry {
    entryType: 'first-input';
    processingStart: number;
}

function initializePerformanceObserver() {
  const po = new PerformanceObserver((entryList) => {
    for (const entry of entryList.getEntries()) {
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
        const layoutShiftEntry = entry as LayoutShiftEntry;
        sendMetric({ name: "CLS", value: layoutShiftEntry.value });
      }
      if (entry.entryType === "longtask") {
        const tbt = entry.duration - 50; // TBT formula\
        sendMetric({ name: "TBT", value: tbt });
      }
      if (entry.entryType === "first-input") {
        const firstInputEntry = entry as FirstInputEntry;
        sendMetric({
          name: "FID",
          value: firstInputEntry.processingStart - entry.startTime,
        });
      }
    }
  });

  po.observe({ type: "paint", buffered: true });
  po.observe({ type: "largest-contentful-paint", buffered: true });
  po.observe({ type: "layout-shift", buffered: true });
  po.observe({ type: "longtask", buffered: true });
  po.observe({ type: "first-input", buffered: true });
}

initializePerformanceObserver();
