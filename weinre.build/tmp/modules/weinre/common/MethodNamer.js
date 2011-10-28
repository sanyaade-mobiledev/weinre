var MethodNamer;
var __hasProp = Object.prototype.hasOwnProperty;
module.exports = MethodNamer = (function() {
  function MethodNamer() {}
  MethodNamer.setNamesForClass = function(aClass) {
    var key, val, _ref, _results;
    for (key in aClass) {
      if (!__hasProp.call(aClass, key)) continue;
      val = aClass[key];
      if (typeof val === "function") {
        val.signature = "" + aClass.name + "::" + key;
        val.displayName = key;
        val.name = key;
      }
    }
    _ref = aClass.prototype;
    _results = [];
    for (key in _ref) {
      if (!__hasProp.call(_ref, key)) continue;
      val = _ref[key];
      _results.push(typeof val === "function" ? (val.signature = "" + aClass.name + "." + key, val.displayName = key, val.name = key) : void 0);
    }
    return _results;
  };
  return MethodNamer;
})();
MethodNamer.setNamesForClass(module.exports);