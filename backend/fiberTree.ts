class TreeNode {
  children: any[];
  siblings: any[];
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
    this.siblings = [];

    this.setTagObj(tag);
    this.setComponentName(elementType, tag, memoizedProps);
    this.setProps(memoizedProps);
    this.setState(memoizedState);
    this.setKey(key);
    this.setHookTypes(_debugHookTypes);


    //render time here includes render time for this fiber node and the time took to render all its children
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
    if (newNode) this.siblings.push(newNode);
  }

  setComponentName(elementType: any, tag: any, memoizedProps: any) {
    try {
      if (elementType && elementType.hasOwnProperty("name")) {
        // Root node will always have the hardcoded component name 'root'
        this.componentName =
          this.tagObj.tagName === "Host Root" ? "Root" : elementType.name;
      } else if (tag === 11 && (memoizedProps.href || memoizedProps.src)) { 
        //setting component name for next's Link components to the href path
        this.componentName = memoizedProps.href ? "link href: " + memoizedProps.href
        : "link src: " + memoizedProps.src
      } else if (elementType && elementType.hasOwnProperty("_payload")) {
        //if component type is react.lazy, then look into its payload to set its name
        if (
          elementType._payload.hasOwnProperty("value") &&
          elementType._payload.value.hasOwnProperty("name")
        ) {
          this.componentName = this.tagObj.tagName =
            elementType._payload.value.name;
        } else {
          this.componentName = "";
        }
      } 
      else {
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
    //if there is a key defined for the component, grab it 
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
        tagName === "Function Component" ||
        tagName === "Forward Ref"
      ) {
        // Create a TreeNode using the FiberNode
        newNode = new TreeNode(fiberNode);
        //console.log(newNode)
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

//function to assign tagNames based on React's work tag assignments
//see: https://github.com/facebook/react/blob/a1f97589fd298cd71f97339a230f016139c7382f/packages/react-reconciler/src/ReactWorkTags.js
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

export { Tree };