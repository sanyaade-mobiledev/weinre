;require.define({"weinre/common/Weinre": function(require, exports, module) { var ConsoleLogger, Ex, IDLTools, StackTrace, Weinre, consoleLogger, getLogger, logger, _notImplemented, _showNotImplemented;
Ex = require('./Ex');
IDLTools = require('./IDLTools');
StackTrace = require('./StackTrace');
_notImplemented = {};
_showNotImplemented = false;
logger = null;
module.exports = Weinre = (function() {
  function Weinre() {
    throw new Ex(arguments, "this class is not intended to be instantiated");
  }
  Weinre.addIDLs = function(idls) {
    return IDLTools.addIDLs(idls);
  };
  Weinre.deprecated = function() {
    return StackTrace.dump(arguments);
  };
  Weinre.notImplemented = function(thing) {
    if (_notImplemented[thing]) {
      return;
    }
    _notImplemented[thing] = true;
    if (!_showNotImplemented) {
      return;
    }
    return Weinre.logWarning(thing + " not implemented");
  };
  Weinre.showNotImplemented = function() {
    var key, _results;
    _showNotImplemented = true;
    _results = [];
    for (key in _notImplemented) {
      _results.push(Weinre.logWarning(key + " not implemented"));
    }
    return _results;
  };
  Weinre.logError = function(message) {
    return getLogger().logError(message);
  };
  Weinre.logWarning = function(message) {
    return getLogger().logWarning(message);
  };
  Weinre.logInfo = function(message) {
    return getLogger().logInfo(message);
  };
  Weinre.logDebug = function(message) {
    return getLogger().logDebug(message);
  };
  return Weinre;
})();
ConsoleLogger = (function() {
  function ConsoleLogger() {}
  ConsoleLogger.prototype.logError = function(message) {
    return console.log("error: " + message);
  };
  ConsoleLogger.prototype.logWarning = function(message) {
    return console.log("warning: " + message);
  };
  ConsoleLogger.prototype.logInfo = function(message) {
    return console.log("info: " + message);
  };
  ConsoleLogger.prototype.logDebug = function(message) {
    return console.log("debug: " + message);
  };
  return ConsoleLogger;
})();
consoleLogger = new ConsoleLogger();
getLogger = function() {
  if (logger) {
    return logger;
  }
  if (Weinre.client) {
    logger = Weinre.WeinreClientCommands;
    return logger;
  }
  if (Weinre.target) {
    logger = Weinre.WeinreTargetCommands;
    return logger;
  }
  return consoleLogger;
};
require("../common/MethodNamer").setNamesForClass(module.exports);
}});
