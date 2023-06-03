class TreeNode {
  children: any[];
  siblings: any[];
  _debugHookTypes: null | string | string[];
  actualStartTime: number;
  componentName: string;
  componentProps: any;
  key: any;
  renderDurationMS: number;
  selfBaseDuration: number;
  tagObj: {
            tag: number;
            tagName: string
          };

  constructor(fiberNode: any) {
    const {
      _debugHookTypes,
      actualDuration,
      actualStartTime,
      elementType,
      key,
      memoizedProps,
      selfBaseDuration,
      tag,
    } = fiberNode;

    //properties to store the found children/siblings
    this.children = [];
    this.siblings = [];

    this.setTagObj(tag);
    this.setComponentName(elementType, tag, memoizedProps);
    this.setProps(memoizedProps);
    this.setKey(key);
    this.setHookTypes(_debugHookTypes);
    //render time here includes render time for this fiber node and the time took to render all its children
    this.setRenderDurationMS(actualDuration);
    this.actualStartTime = actualStartTime;
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

  setRenderDurationMS(actualDuration: number) {
    this.renderDurationMS = actualDuration;
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

  setComponentName(elementType: any, tag: any, memoizedProps: any) {
    try {
      if (elementType && elementType.hasOwnProperty("name")) {
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


}

class Tree {
  root: any;
  constructor(fiberNode: any) {
    this.root = null;
    this.createTree(fiberNode);
  }

  createTree(fiberNode: any) {
    function traverse(fiberNode: any, parentTreeNode: any) {
      const { tag } = fiberNode;
      const tagName = getFiberNodeTagName(tag);
      let newNode: any;
      if (
        //we only want components with these tag names
        tagName === "Host Root" ||
        tagName === "Host Component" || // components usually converted to html-like name
        tagName === "Function Component" ||
        tagName === "Forward Ref" //this is to grab next/link components
      ) {
        newNode = new TreeNode(fiberNode);
        if (!parentTreeNode) {
          this.root = newNode;
        } else {
          parentTreeNode.addChild(newNode);
        }
      }

      if (fiberNode.child) {
        traverse(fiberNode.child, newNode ? newNode : parentTreeNode);
      }

      if (fiberNode.sibling) {
        traverse(fiberNode.sibling, parentTreeNode);
      }
    }

    traverse.apply(this, [fiberNode, null]);
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
        "Unrecognized tag number",
        tagNum
      );
  }

  return tagName;
};

export { Tree };