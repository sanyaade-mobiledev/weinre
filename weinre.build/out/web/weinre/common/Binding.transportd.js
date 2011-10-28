;require.define({"weinre/common/Binding": function(require, exports, module) { var Binding, Ex;
Ex = require('./Ex');
module.exports = Binding = (function() {
  function Binding(receiver, method) {
    if (!receiver) {
      throw new Ex(arguments, "receiver argument for Binding constructor was null");
    }
    if (typeof method === "string") {
      method = receiver[method];
    }
    if (typeof method === !"function") {
      throw new Ex(arguments, "method argument didn't specify a function");
    }
    return function() {
      return method.apply(receiver, [].slice.call(arguments));
    };
  }
  return Binding;
})();
require("../common/MethodNamer").setNamesForClass(module.exports);
}});
