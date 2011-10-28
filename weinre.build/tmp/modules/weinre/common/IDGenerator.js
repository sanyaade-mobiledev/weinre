var IDGenerator, idName, nextId, nextIdValue;
nextIdValue = 1;
idName = "__weinre__id";
module.exports = IDGenerator = (function() {
  function IDGenerator() {}
  IDGenerator.checkId = function(object) {
    return object[idName];
  };
  IDGenerator.getId = function(object, map) {
    var id;
    id = IDGenerator.checkId(object);
    if (!id) {
      id = nextId();
      object[idName] = id;
    }
    if (map) {
      map[id] = object;
    }
    return id;
  };
  IDGenerator.next = function() {
    return nextId();
  };
  return IDGenerator;
})();
nextId = function() {
  var result;
  result = nextIdValue;
  nextIdValue += 1;
  return result;
};
require("../common/MethodNamer").setNamesForClass(module.exports);