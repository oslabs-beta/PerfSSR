function getPatchFetchFunction() {
    return function patchedPatchFetch(...args) {
        console.log("patch fetch");
        //origPatchFetch(...args);
        //globalThis.fetch = perfSSRFetch(globalThis.fetch);
    }
}

const nextBuiltInPatchFetch = require("next/dist/server/lib/patch-fetch");
const origPatchFetch = nextBuiltInPatchFetch.patchFetch;


console.log(nextBuiltInPatchFetch);


//nextBuiltInPatchFetch.patchFetch();

const perfSSRFetch = function (originFetch) {

    return async function (input, init) {
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
      console.log("globalThis inside patch", globalThis);
      perfSSRData2 = timingData;
      globalThis.perfSSRData['data'] = timingData;
      return res;
    }
  
  }