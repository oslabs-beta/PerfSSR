let fiberRoot;

console.log("this means the injected file is running");
//__REACT_DEVTOOLS_GLOBAL_HOOK__ instantiation of React Dev Tools within our app
// can be accessed by using window.__REACT_DEVTOOLS_GLOBAL_HOOK__
console.log("window: ", window.__REACT_DEVTOOLS_GLOBAL_HOOK__);
fiberRoot = window.__REACT_DEVTOOLS_GLOBAL_HOOK__;

if (!fiberRoot) {
  console.log(
    "Unable to grab instance of fiber root. Are you sure Reactt Dev Tools is installed?"
  );
}
console.log(fiberRoot);
