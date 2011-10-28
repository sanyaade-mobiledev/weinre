;require.define({"weinre/common/Callback": function(require, exports, module) { var Callback, CallbackIndex, CallbackTable, ConnectorChannel, Ex;
Ex = require('./Ex');
CallbackTable = {};
CallbackIndex = 1;
ConnectorChannel = "???";
module.exports = Callback = (function() {
  function Callback() {
    throw new Ex(arguments, "this class is not intended to be instantiated");
  }
  Callback.setConnectorChannel = function(connectorChannel) {
    return ConnectorChannel = "" + connectorChannel;
  };
  Callback.register = function(callback) {
    var data, func, index, receiver;
    if (typeof callback === "function") {
      callback = [null, callback];
    }
    if (typeof callback.slice !== "function") {
      throw new Ex(arguments, "callback must be an array or function");
    }
    receiver = callback[0];
    func = callback[1];
    data = callback.slice(2);
    if (typeof func === "string") {
      func = receiver[func];
    }
    if (typeof func !== "function") {
      throw new Ex(arguments, "callback function was null or not found");
    }
    index = ConnectorChannel + "::" + CallbackIndex;
    CallbackIndex++;
    if (CallbackIndex >= 65536 * 65536) {
      CallbackIndex = 1;
    }
    CallbackTable[index] = [receiver, func, data];
    return index;
  };
  Callback.deregister = function(index) {
    return delete CallbackTable[index];
  };
  Callback.invoke = function(index, args) {
    var callback, func, funcName, receiver;
    callback = CallbackTable[index];
    if (!callback) {
      throw new Ex(arguments, "callback " + index + " not registered or already invoked");
    }
    receiver = callback[0];
    func = callback[1];
    args = callback[2].concat(args);
    try {
      return func.apply(receiver, args);
    } catch (e) {
      funcName = func.name || func.signature;
      if (!funcName) {
        funcName = "<unnamed>";
      }
      return require("./Weinre").logError(arguments.callee.signature + (" exception invoking callback: " + funcName + "(" + (args.join(',')) + "): ") + e);
    } finally {
      Callback.deregister(index);
    }
  };
  return Callback;
})();
require("../common/MethodNamer").setNamesForClass(module.exports);
}});
