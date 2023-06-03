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

  
  //patch the original onCommitFiberRoot
  //everytime the virtual dom is updated, send it to devtool
  const patchOnCommitFiber = function (originalOnCommitFiberRootFn: any, updatedFiberTree: any ) {
    // hold on to original function
    rdtOnCommitFiberRoot = originalOnCommitFiberRootFn;
  
    return function (...args: any[]) {
      const rdtFiberRootNode = args[1];
      updatedFiberTree = new Tree(rdtFiberRootNode);
      updatedFiberTree.buildTree(rdtFiberRootNode.current);
      if(updatedFiberTree) {
        window.postMessage(
          {
            type: "UPDATED_FIBER",
            payload: JSON.stringify(updatedFiberTree, replaceCircularObj()),
          },
          "*"
        );
      }

      return originalOnCommitFiberRootFn(...args);
    };
  };
  
  //This function replaces the object that causes a circular object 
  //before it gets stringified
  const replaceCircularObj = () => {
    const seen = new Map();
    return function (key: any, value: any) {
      if (typeof value !== "object" || value === null) {
        return value;
      }
      if (seen.has(value)) {
        return "";
      }
      seen.set(value, true);
      return value;
    };
  };
  
  // listener for everytime onCommitFiber is executed, will intercept it with monkey patching to run additional side effects
  devTool.onCommitFiberRoot = patchOnCommitFiber(devTool.onCommitFiberRoot, updatedFiberTree);

  //Build the tree from root fiber node
  const newTree =
    rootNode && rootNode.current ? new Tree(rootNode.current) : undefined;
  
  
  //Check if the we have an instance of the tree
  //send it to the content script which will send it to background.js
  if (newTree) {
    newTree.createTree(rootNode.current);
  
    window.postMessage(
      {
        type: "FIBER_INSTANCE",
        payload: JSON.stringify(newTree, replaceCircularObj()),
      },
      "*"
    );
  }