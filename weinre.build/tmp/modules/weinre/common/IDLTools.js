var Callback, Ex, IDLTools, IDLs, getProxyMethod;
Ex = require('./Ex');
Callback = require('./Callback');
IDLs = {};
module.exports = IDLTools = (function() {
  function IDLTools() {
    throw new Ex(arguments, "this class is not intended to be instantiated");
  }
  IDLTools.addIDLs = function(idls) {
    var idl, intf, _i, _len, _results;
    _results = [];
    for (_i = 0, _len = idls.length; _i < _len; _i++) {
      idl = idls[_i];
      _results.push((function() {
        var _j, _len2, _ref, _results2;
        _ref = idl.interfaces;
        _results2 = [];
        for (_j = 0, _len2 = _ref.length; _j < _len2; _j++) {
          intf = _ref[_j];
          IDLs[intf.name] = intf;
          _results2.push(intf.module = idl.name);
        }
        return _results2;
      })());
    }
    return _results;
  };
  IDLTools.getIDL = function(name) {
    return IDLs[name];
  };
  IDLTools.getIDLsMatching = function(regex) {
    var intf, intfName, results;
    results = [];
    for (intfName in IDLs) {
      intf = IDLs[intfName];
      if (intfName.match(regex)) {
        results.push(intf);
      }
    }
    return results;
  };
  IDLTools.validateAgainstIDL = function(klass, interfaceName) {
    var classMethod, error, errors, intf, intfMethod, messagePrefix, printName, propertyName, _i, _j, _len, _len2, _ref, _results;
    intf = IDLTools.getIDL(interfaceName);
    messagePrefix = "IDL validation for " + interfaceName + ": ";
    if (null === intf) {
      throw new Ex(arguments, messagePrefix + ("idl not found: '" + interfaceName + "'"));
    }
    errors = [];
    _ref = intf.methods;
    for (_i = 0, _len = _ref.length; _i < _len; _i++) {
      intfMethod = _ref[_i];
      classMethod = klass.prototype[intfMethod.name];
      printName = klass.name + "::" + intfMethod.name;
      if (null === classMethod) {
        errors.push(messagePrefix + ("method not implemented: '" + printName + "'"));
        continue;
      }
      if (classMethod.length !== intfMethod.parameters.length) {
        if (classMethod.length !== intfMethod.parameters.length + 1) {
          errors.push(messagePrefix + ("wrong number of parameters: '" + printName + "'"));
          continue;
        }
      }
    }
    for (propertyName in klass.prototype) {
      if (klass.prototype.hasOwnProperty(propertyName)) {
        continue;
      }
      if (propertyName.match(/^_.*/)) {
        continue;
      }
      printName = klass.name + "::" + propertyName;
      if (!intf.methods[propertyName]) {
        errors.push(messagePrefix + ("method should not be implemented: '" + printName + "'"));
        continue;
      }
    }
    if (!errors.length) {
      return;
    }
    _results = [];
    for (_j = 0, _len2 = errors.length; _j < _len2; _j++) {
      error = errors[_j];
      _results.push(require("./Weinre").logError(error));
    }
    return _results;
  };
  IDLTools.buildProxyForIDL = function(proxyObject, interfaceName) {
    var intf, intfMethod, messagePrefix, _i, _len, _ref, _results;
    intf = IDLTools.getIDL(interfaceName);
    messagePrefix = "building proxy for IDL " + interfaceName + ": ";
    if (null === intf) {
      throw new Ex(arguments, messagePrefix + ("idl not found: '" + interfaceName + "'"));
    }
    _ref = intf.methods;
    _results = [];
    for (_i = 0, _len = _ref.length; _i < _len; _i++) {
      intfMethod = _ref[_i];
      _results.push(proxyObject[intfMethod.name] = getProxyMethod(intf, intfMethod));
    }
    return _results;
  };
  return IDLTools;
})();
getProxyMethod = function(intf, method) {
  var proxyMethod, result;
  result = proxyMethod = function() {
    var args, callbackId;
    callbackId = null;
    args = [].slice.call(arguments);
    if (args.length > 0) {
      if (typeof args[args.length - 1] === "function") {
        callbackId = Callback.register(args[args.length - 1]);
        args = args.slice(0, args.length - 1);
      }
    }
    while (args.length < method.parameters.length) {
      args.push(null);
    }
    args.push(callbackId);
    return this.__invoke(intf.name, method.name, args);
  };
  result.displayName = intf.name + "__" + method.name;
  return result;
};
require("../common/MethodNamer").setNamesForClass(module.exports);