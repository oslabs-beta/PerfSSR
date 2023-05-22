// __REACT_DEVTOOLS_GLOBAL_HOOK__ and Fiber Tree specific variables, no need to type
let devTool;
let rootNode;
let rdtOnCommitFiberRoot;

interface Window {
    __REACT_DEVTOOLS_GLOBAL_HOOK__?: any;
  }

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
    const updatedTree = new Tree(updatedFiberNode.current);
    updatedTree.buildTree(updatedFiberNode.current);
    window.postMessage(
      {
        type: "UPDATED_FIBER",
        payload: JSON.stringify(updatedTree, getCircularReplacer()),
      },
      "*"
    );
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
  
  // ---------------------TREE
  
  class TreeNode {
    children: any[];
    sibling: any[];
    actualStartTime: number;
    selfBaseDuration: number;
    renderDurationMS: number;
    componentName: string;
    tagObj: {
              tag: number;
              tagName: string
            };
    componentState: any;
    componentProps: any;
    key: any;
    _debugHookTypes: null | string | string[];

    constructor(fiberNode: any) {
      const {
        memoizedState,
        memoizedProps,
        elementType,
        tag,
        actualDuration,
        actualStartTime,
        selfBaseDuration,
        key,
        _debugHookTypes,
      } = fiberNode;
  
      this.children = [];
  
      /*
        - tagObj identifies the type of fiber
        - Has two keys:
          1. tag - the tag number from React
          2. tagName - the name corresponding with the tag number
      */
      this.setTagObj(tag);
      this.setComponentName(elementType);
      this.setProps(memoizedProps);
      this.setState(memoizedState);
      this.setKey(key);
      this.setHookTypes(_debugHookTypes);
  
      /*
        - The actual duration is the time spent rendering this Fiber and its descendants for the current update.
        - It includes time spent working on children.
      */
      this.setRenderDurationMS(actualDuration);
  
      // Not sure if we need these, but saving them anyway
  
      /*
        - actualStartTime = If the Fiber is currently active in the "render" phase, it marks the time at which the work began.
        - This field is only set when the enableProfilerTimer flag is enabled.
      */
      this.actualStartTime = actualStartTime;
  
      /*
        - selfBaseDuration = Duration of the most recent render time for this Fiber.
        - This value is not updated when we bailout for memoization purposes.
        - This field is only set when the enableProfilerTimer flag is enabled.
      */
      this.selfBaseDuration = selfBaseDuration;
    }
  
    addChild(newNode: any) {
      if (newNode) {
        this.children.push(newNode);
      }
    }
  
    addSibling(newNode: any) {
      if (newNode) this.sibling.push(newNode);
    }
  
    setComponentName(elementType: any) {
      try {
        if (elementType && elementType.hasOwnProperty("name")) {
          // Root node will always have the hardcoded component name 'root'
          this.componentName =
            this.tagObj.tagName === "Host Root" ? "Root" : elementType.name;
        } else if (elementType && elementType.hasOwnProperty("_payload")) {
          if (
            elementType._payload.hasOwnProperty("value") &&
            elementType._payload.value.hasOwnProperty("name")
          ) {
            this.componentName = this.tagObj.tagName =
              elementType._payload.value.name;
          }
        } else {
          this.componentName = "";
        }
      } catch (error) {
        console.log("tree.setComponentName error:", error.message);
      }
    }
  
    setTagObj(fiberTagNum: number) {
      try {
        if (fiberTagNum !== undefined && fiberTagNum !== null) {
          this.tagObj = {
            tag: fiberTagNum,
            tagName: getFiberNodeTagName(fiberTagNum),
          };
        } else {
          console.log("tree.setTagObj: fiberTagName is undefined!");
        }
      } catch (error) {
        console.log("tree.setTagObj error:", error.message);
      }
    }
  
    setRenderDurationMS(actualDuration: number) {
      this.renderDurationMS = actualDuration;
    }
  
    setState(memoizedState: any) {
      this.componentState = memoizedState;
    }
  
    setProps(memoizedProps: any) {
      this.componentProps = memoizedProps;
    }
  
    setKey(key: any) {
      // The key is (or should be) provided by the developer to help differentiate components
      // of the same type
      // ReaPer uses this to help differentiate components for the graphs in the dashboard
      this.key = key;
    }
  
    setHookTypes(_debugHookTypes: null | string | string[]) {
      this._debugHookTypes = _debugHookTypes;
    }
  }
  
  class Tree {
    root: any;
    constructor(rootFiberNode: any) {
      this.root = null;
      this.buildTree(rootFiberNode);
    }
  
    buildTree(rootFiberNode: any) {
      function traverse(fiberNode: any, parentTreeNode: any) {
        const { tag } = fiberNode;
        const tagName = getFiberNodeTagName(tag);
        //console.log("current fiberNode ", fiberNode);
        //console.log("current elementType", elementType);
        //'Function Component' || tagName === 'Class Component' ||
        let newNode: any;
        if (
          tagName === "Host Root" ||
          tagName === "Host Component" ||
          tagName === "Function Component"
        ) {
          // Create a TreeNode using the FiberNode
          newNode = new TreeNode(fiberNode);
  
          // If parentTreeNode is null, set the root of the tree
          if (!parentTreeNode) {
            this.root = newNode;
          } else {
            // Add the new TreeNode to the parent's children array
            parentTreeNode.addChild(newNode);
          }
        }
  
        // If fiberNode has a child, traverse down the tree
        if (fiberNode.child) {
          traverse(fiberNode.child, newNode ? newNode : parentTreeNode);
        }
  
        // If fiberNode has a sibling, traverse to the sibling
  
        if (fiberNode.sibling) {
          traverse(fiberNode.sibling, parentTreeNode);
        }
      }
  
      traverse.call(this, rootFiberNode, null);
    }
  }
  
  const getFiberNodeTagName = (tagNum: number) => {
    let tagName: string = "";
  
    switch (tagNum) {
      case 0:
        tagName = "Function Component";
        break;
      case 1:
        tagName = "Class Component";
        break;
      case 2:
        tagName = "Indeterminate Component";
        break;
      case 3:
        tagName = "Host Root";
        break;
      case 4:
        tagName = "Host Portal";
        break;
      case 5:
        tagName = "Host Component";
        break;
      case 6:
        tagName = "Host Text";
        break;
      case 7:
        tagName = "Fragment";
        break;
      case 8:
        tagName = "Mode";
        break;
      case 9:
        tagName = "Context Consumer";
        break;
      case 10:
        tagName = "Context Provider";
        break;
      case 11:
        tagName = "Forward Ref";
        break;
      case 12:
        tagName = "Profiler";
        break;
      case 13:
        tagName = "Suspense Component";
        break;
      case 14:
        tagName = "Memo Component";
        break;
      case 15:
        tagName = "Simple Memo Component";
        break;
      case 16:
        tagName = "Lazy Component";
        break;
      case 17:
        tagName = "Incomplete Class Component";
        break;
      case 18:
        tagName = "Dehydrated Fragment";
        break;
      case 19:
        tagName = "Suspense List Component";
        break;
      case 21:
        tagName = "Scope Component";
        break;
      case 22:
        tagName = "Offscreen Component";
        break;
      case 23:
        tagName = "Legacy Hidden Component";
        break;
      case 24:
        tagName = "Cache Component";
        break;
      case 25:
        tagName = "Tracing Marker Component";
        break;
      case 26:
        tagName = "Host Hoistable";
        break;
      case 27:
        tagName = "Host Singleton";
        break;
      default:
        console.log(
          "helperFns getFiberNodeTagName error - unrecognized tag number ",
          tagNum
        );
    }
  
    return tagName;
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