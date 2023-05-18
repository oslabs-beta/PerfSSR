interface PerfSSR {
  fetch: typeof globalThis.fetch;
}

const originalFetch = globalThis.fetch;

const perfSSRFetch = function (originFetch: PerfSSR['fetch'] ) {

  return async function (input: string | RequestInfo | URL, init: RequestInit | undefined) {
    
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

    return res;
  }

}

export const install = (patchFunc?: PerfSSR['fetch']) => {
 globalThis.fetch = patchFunc ?? perfSSRFetch(globalThis.fetch);
};

export const uninstall = () => {
  globalThis.fetch = originalFetch;
};

// Monkey patching immediately on package load
// globalThis.fetch = perfSSRFetch(globalThis.fetch);
install();