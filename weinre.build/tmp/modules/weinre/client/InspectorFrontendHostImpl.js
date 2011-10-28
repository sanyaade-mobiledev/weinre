var IDLTools, InspectorFrontendHostImpl, Weinre, _extensionAPI;
Weinre = require('../common/Weinre');
IDLTools = require('../common/IDLTools');
_extensionAPI = null;
module.exports = InspectorFrontendHostImpl = (function() {
  function InspectorFrontendHostImpl() {
    this._getPlatformAndPort();
  }
  InspectorFrontendHostImpl.prototype.loaded = function() {};
  InspectorFrontendHostImpl.prototype.localizedStringsURL = function() {
    return "nls/English.lproj/localizedStrings.js";
  };
  InspectorFrontendHostImpl.prototype.hiddenPanels = function() {
    return "audits,profiles,network";
  };
  InspectorFrontendHostImpl.prototype.platform = function() {
    return "weinre";
  };
  InspectorFrontendHostImpl.prototype.port = function() {
    return "weinre";
  };
  InspectorFrontendHostImpl.prototype.sendMessageToBackend = function(message) {
    var object;
    object = JSON.parse(message);
    if (object[0] === "setInjectedScriptSource") {
      object[1] = "<long script elided>";
    }
    return Weinre.logInfo(arguments.callee.name + ("(" + (JSON.stringify(object, null, 4)) + ")"));
  };
  InspectorFrontendHostImpl.prototype.setExtensionAPI = function(extensionAPI) {
    return _extensionAPI = extensionAPI;
  };
  InspectorFrontendHostImpl.prototype.getExtensionAPI = function() {
    return _extensionAPI;
  };
  InspectorFrontendHostImpl.prototype.inspectedURLChanged = function() {};
  InspectorFrontendHostImpl.prototype._getPlatformAndPort = function() {
    var key, pieces, properties, property, splits, uas, url, val, _i, _len, _results;
    this._platform = "weinre";
    this._platformFlavor = "weinre";
    this._port = "weinre";
    if (true) {
      return;
    }
    uas = navigator.userAgent;
    if (uas.match(/mac os x/i)) {
      this._platform = "mac";
    } else if (uas.match(/macintosh/i)) {
      this._platform = "mac";
    } else if (uas.match(/linux/i)) {
      this._platform = "linux";
    } else {
      if (uas.match(/windows/i)) {
        this._platform = "windows";
      }
    }
    url = window.location.href;
    splits = url.split("#", 2);
    if (splits.length > 1) {
      properties = splits[1];
      properties = properties.split("&");
      _results = [];
      for (_i = 0, _len = properties.length; _i < _len; _i++) {
        property = properties[_i];
        pieces = property.split("=");
        _results.push(pieces.length > 1 ? (key = pieces[0], val = pieces[1], key === "platform" ? this._platform = val : key === "platformFlavor" ? this._platformFlavor = val : key === "port" ? this._port = val : void 0) : void 0);
      }
      return _results;
    }
  };
  return InspectorFrontendHostImpl;
})();
require("../common/MethodNamer").setNamesForClass(module.exports);