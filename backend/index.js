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




// ---------------------TREE


class TreeNode {
  constructor (fiberNode) {

    const {
      memoizedState,
      memoizedProps,
      elementType,
      tag,
      actualDuration,
      actualStartTime,
      selfBaseDuration,
      key
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

  addChild(newNode) {
    if (newNode) {
      // Don't set the parent - this causes issues when trying to invoke JSON.stringify
      // on the ReaperSession obj.
      //newNode.parent = this;
      this.children.push(newNode);
    }
  }

  setComponentName(elementType) {
    try {
      if (elementType && Object.hasOwn(elementType, 'name')) {
        // Root node will always have the hardcoded component name 'root'
        this.componentName = this.tagObj.tagName === 'Host Root' ? 'Root' : elementType.name;
      } else {
        this.componentName = '';
      }
    } catch (error) {
      console.log('tree.setComponentName error:', error.message);
    }
  }

  setTagObj(fiberTagNum) {
    try {   
      if (fiberTagNum !== undefined && fiberTagNum !== null) {
        this.tagObj = {
          tag: fiberTagNum,
          tagName: getFiberNodeTagName(fiberTagNum)
        }
      } else {
        console.log('tree.setTagObj: fiberTagName is undefined!');
      }
    } catch (error) {
      console.log('tree.setTagObj error:', error.message);
    }
  }

  setRenderDurationMS(actualDuration) {
    this.renderDurationMS = actualDuration;
  }

  setState(memoizedState) {
    this.componentState = memoizedState;
  }

  setProps(memoizedProps) {
    this.componentProps = memoizedProps;
  }

  setKey(key) {
    // The key is (or should be) provided by the developer to help differentiate components
    // of the same type
    // ReaPer uses this to help differentiate components for the graphs in the dashboard
    this.key = key;
  }

}



class Tree {
  constructor(rootFiberNode) {
    this.root = null;
    this.buildTree(rootFiberNode);
  }

  buildTree(rootFiberNode) {
    function traverse(fiberNode, parentTreeNode) {
      const {
        tag
      } = fiberNode;
      const tagName = getFiberNodeTagName(tag);

      //tagName === 'Function Component' || tagName === 'Class Component' ||
      let newNode;
      if (tagName === 'Function Component' || tagName === 'Host Root' || tagName === 'Host Component' || tagName === 'Class Component' ) {
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

const getFiberNodeTagName = (tagNum) => {
  let tagName = '';

  switch (tagNum) {
    case 0:
      tagName = 'Function Component';
      break;
    case 1:
      tagName = 'Class Component';
      break;
    case 2:
      tagName = 'Indeterminate Component';
      break;
    case 3:
      tagName = 'Host Root';
      break;
    case 4:
      tagName = 'Host Portal';
      break;
    case 5:
      tagName = 'Host Component';
      break;
    case 6:
      tagName = 'Host Text';
      break;
    case 7:
      tagName = 'Fragment';
      break;
    case 8:
      tagName = 'Mode';
      break;
    case 9:
      tagName = 'Context Consumer';
      break;
    case 10:
      tagName = 'Context Provider';
      break;
    case 11:
      tagName = 'Forward Ref';
      break;
    case 12:
      tagName = 'Profiler';
      break;
    case 13:
      tagName = 'Suspense Component';
      break;
    case 14:
      tagName = 'Memo Component';
      break;
    case 15:
      tagName = 'Simple Memo Component';
      break;
    case 16:
      tagName = 'Lazy Component';
      break;
    case 17:
      tagName = 'Incomplete Class Component';
      break;
    case 18:
      tagName = 'Dehydrated Fragment';
      break;
    case 19:
      tagName = 'Suspense List Component';
      break;
    case 21:
      tagName = 'Scope Component';
      break;
    case 22:
      tagName = 'Offscreen Component';
      break;
    case 23:
      tagName = 'Legacy Hidden Component';
      break;
    case 24:
      tagName = 'Cache Component';
      break;
    case 25:
      tagName = 'Tracing Marker Component';
      break;
    case 26:
      tagName = 'Host Hoistable';
      break;
    case 27:
      tagName = 'Host Singleton';
      break;
    default:
      console.log('helperFns getFiberNodeTagName error - unrecognized tag number ', tagNum);
  }

  return tagName;
};



const newTree = new Tree(rootNode.current)
newTree.buildTree(rootNode.current)

console.log(newTree)