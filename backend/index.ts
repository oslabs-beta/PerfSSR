import { Tree } from './fiberTree';
// __REACT_DEVTOOLS_GLOBAL_HOOK__ and Fiber Tree specific variables, no need to type
let devTool;
let rootNode;
let rdtOnCommitFiberRoot;
let updatedFiberTree: any;

// Listen for clicks
let url = location.href;
window.addEventListener(
  "click",
  () => {
    requestAnimationFrame(() => {
      if (url !== location.href && updatedFiberTree) {
        window.postMessage(
          {
            type: "UPDATED_FIBER",
            payload: JSON.stringify(updatedFiberTree, getCircularReplacer()),
          },
          "*"
        );
        url = location.href;
      }
    });
  },
  true
);

console.log("this means the injected file is running");
//__REACT_DEVTOOLS_GLOBAL_HOOK__ instantiation of React Dev Tools within our app
// can be accessed by using window.__REACT_DEVTOOLS_GLOBAL_HOOK__
devTool = window.__REACT_DEVTOOLS_GLOBAL_HOOK__;
console.log("RDT instance", devTool);

rootNode = devTool.getFiberRoots(1).values().next().value;
console.log(rootNode);

if (!devTool) {
  console.log(
    "Unable to grab instance of fiber root. Are you sure React Dev Tools is installed?"
  );
}

// Limits calls made on a function (new render event) in a period of time
const throttle = (func: (arg: any) => void, delayMS: number):((arg: any) => void) => {
  let shouldWait = false;

  // return function that takes new render event's fiber node arg
  return (arg) => {
    if (shouldWait) {
      console.log("throttle anonymous: shouldWait is true, returning....");
      return;
    }

    func(arg);
    shouldWait = true;

    setTimeout(() => {
      shouldWait = false;
    }, delayMS);
  };
};

//Execute throttle on new updated fiber root
// No need to type Fiber Tree specific variable
const throttleUpdatedFiberTree = throttle(function (updatedFiberNode) {
  updatedFiberTree = new Tree(updatedFiberNode.current);
  updatedFiberTree.buildTree(updatedFiberNode.current);
  }, 500);
  
  //intercept the original onCommitFiberRoot
  const intercept = function (originalOnCommitFiberRootFn: any) {
    // preserve origial onCommitFiberRoot
    rdtOnCommitFiberRoot = originalOnCommitFiberRootFn;
  
    return function (...args: any[]) {
      const rdtFiberRootNode = args[1]; // root a rgument (args: rendererID, root, priorityLevel)
      if (rdtFiberRootNode) {
        throttleUpdatedFiberTree(rdtFiberRootNode);
      }
      return originalOnCommitFiberRootFn(...args);
    };
  };
  
  const getCircularReplacer = () => {
    const seen = new Map();
    return function (key: any, value: any) {
      if (typeof value !== "object" || value === null) {
        return value;
      }
      if (seen.has(value)) {
        return "[Circular]";
      }
      seen.set(value, true);
      return value;
    };
  };
  
  // listener for everytime onCommitFiber is executed, will intercept it with monkey patching to run additional side effects
  
  devTool.onCommitFiberRoot = intercept(devTool.onCommitFiberRoot);
  
  //Build the tree from root fiber node
  const newTree = new Tree(rootNode.current);
  
  console.log("built tree", newTree);
  
  //Check if the we have an instance of the tree
  //send it to the content script which will send it to background.js
  if (newTree) {
    newTree.buildTree(rootNode.current);
  
    window.postMessage(
      {
        type: "FIBER_INSTANCE",
        payload: JSON.stringify(newTree, getCircularReplacer()),
      },
      "*"
    );
  }