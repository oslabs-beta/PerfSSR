export async function register() {
  //instrumentation only works on node runtime not edge
  if (process.env.NEXT_RUNTIME === "nodejs") {
    await import("./instrumentation.node");
  }
}
