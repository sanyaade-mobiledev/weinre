;require.define({"weinre/target/ExceptionalCallbacks": function(require, exports, module) { var Ex, ExceptionalCallbacks, HookSites, addHookEventListener, addHookTimer, callSite_nodeAEL, callSite_setInterval, callSite_setTimeout, callSite_windowAEL, callSite_xhrAEL, getFunctionName, getStackTrace, instrumentedCallback;
Ex = require('../common/Ex');
HookSites = require('./HookSites');
module.exports = ExceptionalCallbacks = (function() {
  function ExceptionalCallbacks() {}
  ExceptionalCallbacks.addHooks = function() {
    addHookTimer(HookSites.window_setInterval, callSite_setInterval);
    addHookTimer(HookSites.window_setTimeout, callSite_setTimeout);
    addHookEventListener(HookSites.window_addEventListener, callSite_windowAEL);
    addHookEventListener(HookSites.Node_addEventListener, callSite_nodeAEL);
    return addHookEventListener(HookSites.XMLHttpRequest_addEventListener, callSite_xhrAEL);
  };
  return ExceptionalCallbacks;
})();
addHookTimer = function(hookSite, formatter) {
  return hookSite.addHooks({
    before: function(receiver, args) {
      var callSite, code, millis;
      code = args[0];
      if (typeof code !== "function") {
        return;
      }
      millis = args[1];
      callSite = formatter(millis, code);
      return args[0] = instrumentedCallback(code, callSite);
    }
  });
};
addHookEventListener = function(hookSite, formatter) {
  return hookSite.addHooks({
    before: function(receiver, args) {
      var callSite, code, event;
      code = args[1];
      if (typeof code !== "function") {
        return;
      }
      event = args[0];
      callSite = formatter(event, code, receiver);
      return args[1] = instrumentedCallback(code, callSite);
    }
  });
};
instrumentedCallback = function(code, callSite) {
  var instrumentedCode;
  if (typeof code !== "function") {
    return code;
  }
  instrumentedCode = function() {
    try {
      return code.apply(this, arguments);
    } catch (e) {
      console.log("exception in callback: " + e);
      console.log("  callsite: " + callSite);
      if (e.stack) {
        console.log("stack at time of exception:");
        console.log(e.stack);
      }
      throw e;
    }
  };
  return instrumentedCode;
};
callSite_setTimeout = function(time, func) {
  return "setTimeout(" + (getFunctionName(func)) + ", " + time + ")";
};
callSite_setInterval = function(time, func) {
  return "setInterval(" + (getFunctionName(func)) + ", " + time + ")";
};
callSite_windowAEL = function(event, func) {
  return "window.addEventListener('" + event + "', " + (getFunctionName(func)) + ")";
};
callSite_nodeAEL = function(event, func, node) {
  if (node.nodeName) {
    node = node.nodeName;
  }
  return "" + node + ".addEventListener('" + event + "', " + (getFunctionName(func)) + ")";
};
callSite_xhrAEL = function(event, func) {
  return "XMLHttpRequest.addEventListener('" + event + "', " + (getFunctionName(func)) + ")";
};
getFunctionName = function(func) {
  if (func.displayName) {
    return func.displayName;
  }
  if (func.name) {
    return func.name;
  }
  return '<anonymous>';
};
getStackTrace = function(e) {
  if (e.stack) {
    return e.stack;
  }
  return null;
};
require("../common/MethodNamer").setNamesForClass(module.exports);
}});
