import { Tree } from './fiberTree';
// __REACT_DEVTOOLS_GLOBAL_HOOK__ and Fiber Tree specific variables, no need to type
let devTool;
let rootNode;
let rdtOnCommitFiberRoot;
let updatedFiberTree: any;


//__REACT_DEVTOOLS_GLOBAL_HOOK__ instantiation of React Dev Tools within our app
// can be accessed by using window.__REACT_DEVTOOLS_GLOBAL_HOOK__
devTool = window.__REACT_DEVTOOLS_GLOBAL_HOOK__;

rootNode = devTool.getFiberRoots(1).values().next().value;

if (!devTool) {
  console.log(
    "Unable to grab instance of fiber root. Make sure React DevTools is installed."
  );
}

// Limits calls made on a function (new render event) in a period of time
const throttle = (
  func: (arg: any) => void,
  delayMS: number
): ((arg: any) => void) => {
  let shouldWait = false;

  // return function that takes new render event's fiber node arg
  return (arg) => {
    if (shouldWait) {
      return;
    }

    shouldWait = true;

    setTimeout(
      () => {
        func(arg);
        shouldWait = false;
      },
      delayMS,
      func
    );
  };
};

//Execute throttle on new updated fiber root
// No need to type Fiber Tree specific variable
const throttleUpdatedFiberTree = throttle(function (updatedFiberNode) {
  updatedFiberTree = new Tree(updatedFiberNode.current);
  updatedFiberTree.buildTree(updatedFiberNode.current);
  }, 70);
  
  //intercept the original onCommitFiberRoot
  const intercept = function (originalOnCommitFiberRootFn: any, updatedFiberTree: any ) {
    // preserve origial onCommitFiberRoot
    rdtOnCommitFiberRoot = originalOnCommitFiberRootFn;
  
    return function (...args: any[]) {
      const rdtFiberRootNode = args[1]; // root a rgument (args: rendererID, root, priorityLevel)
      updatedFiberTree = new Tree(rdtFiberRootNode);
      updatedFiberTree.buildTree(rdtFiberRootNode.current);
      if(updatedFiberTree) {
        window.postMessage(
          {
            type: "UPDATED_FIBER",
            payload: JSON.stringify(updatedFiberTree, getCircularReplacer()),
          },
          "*"
        );
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
  devTool.onCommitFiberRoot = intercept(devTool.onCommitFiberRoot, updatedFiberTree);

  //Build the tree from root fiber node
  const newTree =
    rootNode && rootNode.current ? new Tree(rootNode.current) : undefined;
  
  
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