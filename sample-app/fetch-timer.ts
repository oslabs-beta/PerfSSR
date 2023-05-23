interface PerfSSR {
  fetch: typeof globalThis.fetch;
}

// globalThis.perfSSRData = {data: []};
// console.log('globalThis perfssr server', globalThis);
export let perfSSRData2;

const originalFetch = globalThis.fetch;

// const nextBuiltInPatchFetch = require("next/src/server/lib/patch-fetch");
// console.log(nextBuiltInPatchFetch);
// console.log(nextBuiltInPatchFetch.patchFetch);



const perfSSRFetch = function (originFetch: PerfSSR['fetch'], fetchCallback: (data: object) => {}) {
  globalThis.perfSSRData = {data: []};
  return async function (input: string | RequestInfo | URL, init: RequestInit | undefined) {
    console.log("inside patched fetch");
    const reqStart = performance.now(), timeStart = new Date();
    performance.mark(`fetchStart:${input}`);
    const res = await originFetch(input);
    performance.mark(`fetchEnd:${input}`);
    const reqEnd = performance.now(), timeEnd = new Date();

    const durationStr = (reqEnd - reqStart);
    console.log("fetching URL:", input);
    console.log("timeStart", timeStart.toISOString());
    console.log("timeEnd", timeEnd.toISOString());
    console.log("time fetch took:", durationStr);
    
    const timingData = {
      start: timeStart.toISOString(),
      end: timeEnd.toISOString(),
      url: input,
      duration: durationStr
    };
    console.log(timingData);


    // fetchCallback(timingData);
    perfSSRData2 = timingData;
    globalThis.perfSSRData['data'].push({timingData});
    (fetch as any).isPatched = true;
    return res;
  };
}

export const install = (fetchCallback: (data: object) => {}, patchFunc?: typeof fetch) => {
 if ((fetch as any).isPatched !== true) {
   globalThis.fetch = patchFunc ?? perfSSRFetch(globalThis.fetch, fetchCallback);
   console.log("installed!")
 } else {
  console.log("already installed")
 }

};

export const uninstall = () => {
  globalThis.fetch = originalFetch;
};

// Monkey patching immediately on package load
// globalThis.fetch = perfSSRFetch(globalThis.fetch);
// install();