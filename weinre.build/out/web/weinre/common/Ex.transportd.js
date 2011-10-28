;require.define({"weinre/common/Ex": function(require, exports, module) { var Ex, StackTrace, prefix;
StackTrace = require('./StackTrace');
module.exports = Ex = (function() {
  function Ex(args, message) {
    if (!args || !args.callee) {
      throw Ex(arguments, "first parameter must be an Arguments object");
    }
    StackTrace.dump(args);
    if (message instanceof Error) {
      message = "threw error: " + message;
    }
    message = prefix(args, message);
    message;
  }
  return Ex;
})();
prefix = function(args, string) {
  if (args.callee.signature) {
    return args.callee.signature + ": " + string;
  }
  if (args.callee.displayName) {
    return args.callee.displayName + ": " + string;
  }
  if (args.callee.name) {
    return args.callee.name + ": " + string;
  }
  return "<anonymous>" + ": " + string;
};
require("../common/MethodNamer").setNamesForClass(module.exports);
}});
