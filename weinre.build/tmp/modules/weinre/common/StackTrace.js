var StackTrace, getTrace;
module.exports = StackTrace = (function() {
  function StackTrace(args) {
    if (!args || !args.callee) {
      throw Error("first parameter to " + arguments.callee.signature + " must be an Arguments object");
    }
    this.trace = getTrace(args);
  }
  StackTrace.dump = function(args) {
    var stackTrace;
    args = args || arguments;
    stackTrace = new StackTrace(args);
    return stackTrace.dump();
  };
  StackTrace.prototype.dump = function() {
    var frame, _i, _len, _ref, _results;
    console.log("StackTrace:");
    _ref = this.trace;
    _results = [];
    for (_i = 0, _len = _ref.length; _i < _len; _i++) {
      frame = _ref[_i];
      _results.push(console.log("    " + frame));
    }
    return _results;
  };
  return StackTrace;
})();
getTrace = function(args) {
  var func, result, visitedFuncs;
  result = [];
  visitedFuncs = [];
  func = args.callee;
  while (func) {
    if (func.signature) {
      result.push(func.signature);
    } else if (func.displayName) {
      result.push(func.displayName);
    } else if (func.name) {
      result.push(func.name);
    } else {
      result.push("<anonymous>");
    }
    if (-1 !== visitedFuncs.indexOf(func)) {
      result.push("... recursion");
      return result;
    }
    visitedFuncs.push(func);
    func = func.caller;
  }
  return result;
};
require("../common/MethodNamer").setNamesForClass(module.exports);