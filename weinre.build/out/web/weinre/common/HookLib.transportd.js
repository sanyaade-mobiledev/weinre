;require.define({"weinre/common/HookLib": function(require, exports, module) { var HookLib, HookSite, HookSites, IgnoreHooks, callAfterHooks, callBeforeHooks, callExceptHooks, getHookSite, getHookedFunction;
HookLib = exports;
HookSites = [];
IgnoreHooks = 0;
module.exports = HookLib = (function() {
  function HookLib() {}
  HookLib.addHookSite = function(object, property) {
    return getHookSite(object, property, true);
  };
  HookLib.getHookSite = function(object, property) {
    return getHookSite(object, property, false);
  };
  HookLib.ignoreHooks = function(func) {
    var result;
    try {
      IgnoreHooks++;
      result = func.call();
    } finally {
      IgnoreHooks--;
    }
    return result;
  };
  return HookLib;
})();
getHookSite = function(object, property, addIfNotFound) {
  var hookSite, i, _i, _len;
  i = 0;
  for (_i = 0, _len = HookSites.length; _i < _len; _i++) {
    hookSite = HookSites[_i];
    if (hookSite.object !== object) {
      continue;
    }
    if (hookSite.property !== property) {
      continue;
    }
    return hookSite;
  }
  if (!addIfNotFound) {
    return null;
  }
  hookSite = new HookSite(object, property);
  HookSites.push(hookSite);
  return hookSite;
};
HookSite = (function() {
  function HookSite(object, property) {
    var hookedFunction;
    this.object = object;
    this.property = property;
    this.target = object[property];
    this.hookss = [];
    hookedFunction = getHookedFunction(this.target, this);
    object[property] = hookedFunction;
  }
  HookSite.prototype.addHooks = function(hooks) {
    return this.hookss.push(hooks);
  };
  HookSite.prototype.removeHooks = function(hooks) {
    var i, _ref;
    for (i = 0, _ref = this.hookss.length; 0 <= _ref ? i <= _ref : i >= _ref; 0 <= _ref ? i++ : i--) {
      if (this.hookss[i] === hooks) {
        this.hookss.splice(i, 1);
        return;
      }
    }
  };
  return HookSite;
})();
getHookedFunction = function(func, hookSite) {
  var hookedFunction;
  hookedFunction = function() {
    var result;
    callBeforeHooks(hookSite, this, arguments);
    try {
      result = func.apply(this, arguments);
    } catch (e) {
      callExceptHooks(hookSite, this, arguments, e);
      throw e;
    } finally {
      callAfterHooks(hookSite, this, arguments, result);
    }
    return result;
  };
  hookedFunction.displayName = func.displayName || func.name;
  return hookedFunction;
};
callBeforeHooks = function(hookSite, receiver, args) {
  var hooks, _i, _len, _ref, _results;
  if (IgnoreHooks > 0) {
    return;
  }
  _ref = hookSite.hookss;
  _results = [];
  for (_i = 0, _len = _ref.length; _i < _len; _i++) {
    hooks = _ref[_i];
    _results.push(hooks.before ? hooks.before.call(hooks, receiver, args) : void 0);
  }
  return _results;
};
callAfterHooks = function(hookSite, receiver, args, result) {
  var hooks, _i, _len, _ref, _results;
  if (IgnoreHooks > 0) {
    return;
  }
  _ref = hookSite.hookss;
  _results = [];
  for (_i = 0, _len = _ref.length; _i < _len; _i++) {
    hooks = _ref[_i];
    _results.push(hooks.after ? hooks.after.call(hooks, receiver, args, result) : void 0);
  }
  return _results;
};
callExceptHooks = function(hookSite, receiver, args, e) {
  var hooks, _i, _len, _ref, _results;
  if (IgnoreHooks > 0) {
    return;
  }
  _ref = hookSite.hookss;
  _results = [];
  for (_i = 0, _len = _ref.length; _i < _len; _i++) {
    hooks = _ref[_i];
    _results.push(hooks.except ? hooks.except.call(hooks, receiver, args, e) : void 0);
  }
  return _results;
};
require("../common/MethodNamer").setNamesForClass(module.exports);
}});
