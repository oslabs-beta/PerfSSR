let devTool;
let rootNode;

console.log("this means the injected file is running");
//__REACT_DEVTOOLS_GLOBAL_HOOK__ instantiation of React Dev Tools within our app
// can be accessed by using window.__REACT_DEVTOOLS_GLOBAL_HOOK__
devTool = window.__REACT_DEVTOOLS_GLOBAL_HOOK__;
console.log("RDT instance", devTool);

if (!devTool) {
  console.log(
    "Unable to grab instance of fiber root. Are you sure Reactt Dev Tools is installed?"
  );
}


rootNode = devTool.getFiberRoots(1).values().next().value;
console.log(rootNode);
