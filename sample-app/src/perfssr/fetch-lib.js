let ogFetchServerResponse;

const perfssrFetch = async (url) => {
  const reqStart = performance.now(), timeStart = new Date();
  const res = await fetch(url);
  const reqEnd = performance.now(), timeEnd = new Date();

  const durationStr = (reqEnd - reqStart);

  console.log("timeStart", timeStart.toISOString());
  console.log("timeEnd", timeEnd.toISOString());
  console.log("time fetch took:", durationStr);
  return res;
}

export const patchfetchServerResponse = function (originalFetchServerRes) {
  //save original fetchServerResponse
  ogFetchServerResponse = originalFetchServerRes;

  return async function (...args) {

    const reqStart = performance.now(), timeStart = new Date();
    const res = await originalFetchServerRes(...args);
    const reqEnd = performance.now(), timeEnd = new Date();

    const durationStr = (reqEnd - reqStart);
    console.log("fetching URL:", ...args);
    console.log("timeStart", timeStart.toISOString());
    console.log("timeEnd", timeEnd.toISOString());
    console.log("time fetch took:", durationStr);

    return res;
  }

}

// export default {perfssrFetch, patchfetchServerResponse};