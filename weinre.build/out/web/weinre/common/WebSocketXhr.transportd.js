;require.define({"weinre/common/WebSocketXhr": function(require, exports, module) { var EventListeners, Ex, HookLib, WebSocketXhr, Weinre, _xhrEventHandler;
Ex = require('./Ex');
Weinre = require('./Weinre');
HookLib = require('./HookLib');
EventListeners = require('./EventListeners');
module.exports = WebSocketXhr = (function() {
  WebSocketXhr.CONNECTING = 0;
  WebSocketXhr.OPEN = 1;
  WebSocketXhr.CLOSING = 2;
  WebSocketXhr.CLOSED = 3;
  function WebSocketXhr(url, id) {
    this.initialize(url, id);
  }
  WebSocketXhr.prototype.initialize = function(url, id) {
    if (!id) {
      id = "anonymous";
    }
    this.readyState = WebSocketXhr.CONNECTING;
    this._url = url;
    this._id = id;
    this._urlChannel = null;
    this._queuedSends = [];
    this._sendInProgress = true;
    this._listeners = {
      open: new EventListeners(),
      message: new EventListeners(),
      error: new EventListeners(),
      close: new EventListeners()
    };
    return this._getChannel();
  };
  WebSocketXhr.prototype._getChannel = function() {
    var body;
    body = JSON.stringify({
      id: this._id
    });
    return this._xhr(this._url, "POST", body, this._handleXhrResponseGetChannel);
  };
  WebSocketXhr.prototype._handleXhrResponseGetChannel = function(xhr) {
    var object;
    if (xhr.status !== 200) {
      return this._handleXhrResponseError(xhr);
    }
    try {
      object = JSON.parse(xhr.responseText);
    } catch (e) {
      this._fireEventListeners("error", {
        message: "non-JSON response from channel open request"
      });
      this.close();
      return;
    }
    if (!object.channel) {
      this._fireEventListeners("error", {
        message: "channel open request did not include a channel"
      });
      this.close();
      return;
    }
    this._urlChannel = this._url + "/" + object.channel;
    this.readyState = WebSocketXhr.OPEN;
    this._fireEventListeners("open", {
      message: "open",
      channel: object.channel
    });
    this._sendInProgress = false;
    this._sendQueued();
    return this._readLoop();
  };
  WebSocketXhr.prototype._readLoop = function() {
    if (this.readyState === WebSocketXhr.CLOSED) {
      return;
    }
    if (this.readyState === WebSocketXhr.CLOSING) {
      return;
    }
    return this._xhr(this._urlChannel, "GET", "", this._handleXhrResponseGet);
  };
  WebSocketXhr.prototype._handleXhrResponseGet = function(xhr) {
    var data, datum, self, _i, _len, _results;
    self = this;
    if (xhr.status !== 200) {
      return this._handleXhrResponseError(xhr);
    }
    try {
      datum = JSON.parse(xhr.responseText);
    } catch (e) {
      this.readyState = WebSocketXhr.CLOSED;
      this._fireEventListeners("error", {
        message: "non-JSON response from read request"
      });
      return;
    }
    HookLib.ignoreHooks(function() {
      return setTimeout((function() {
        return self._readLoop();
      }), 0);
    });
    _results = [];
    for (_i = 0, _len = datum.length; _i < _len; _i++) {
      data = datum[_i];
      _results.push(self._fireEventListeners("message", {
        data: data
      }));
    }
    return _results;
  };
  WebSocketXhr.prototype.send = function(data) {
    if (typeof data !== "string") {
      throw new Ex(arguments, this.constructor.name + "." + this.caller);
    }
    this._queuedSends.push(data);
    if (this._sendInProgress) {
      return;
    }
    return this._sendQueued();
  };
  WebSocketXhr.prototype._sendQueued = function() {
    var datum;
    if (this._queuedSends.length === 0) {
      return;
    }
    if (this.readyState === WebSocketXhr.CLOSED) {
      return;
    }
    if (this.readyState === WebSocketXhr.CLOSING) {
      return;
    }
    datum = JSON.stringify(this._queuedSends);
    this._queuedSends = [];
    this._sendInProgress = true;
    return this._xhr(this._urlChannel, "POST", datum, this._handleXhrResponseSend);
  };
  WebSocketXhr.prototype._handleXhrResponseSend = function(xhr) {
    var httpSocket;
    httpSocket = this;
    if (xhr.status !== 200) {
      return this._handleXhrResponseError(xhr);
    }
    this._sendInProgress = false;
    return HookLib.ignoreHooks(function() {
      return setTimeout((function() {
        return httpSocket._sendQueued();
      }), 0);
    });
  };
  WebSocketXhr.prototype.close = function() {
    this._sendInProgress = true;
    this.readyState = WebSocketXhr.CLOSING;
    this._fireEventListeners("close", {
      message: "closing",
      wasClean: true
    });
    return this.readyState = WebSocketXhr.CLOSED;
  };
  WebSocketXhr.prototype.addEventListener = function(type, listener, useCapture) {
    return this._getListeners(type).add(listener, useCapture);
  };
  WebSocketXhr.prototype.removeEventListener = function(type, listener, useCapture) {
    return this._getListeners(type).remove(listener, useCapture);
  };
  WebSocketXhr.prototype._fireEventListeners = function(type, event) {
    if (this.readyState === WebSocketXhr.CLOSED) {
      return;
    }
    event.target = this;
    return this._getListeners(type).fire(event);
  };
  WebSocketXhr.prototype._getListeners = function(type) {
    var listeners;
    listeners = this._listeners[type];
    if (null === listeners) {
      throw new Ex(arguments, "invalid event listener type: '" + type + "'");
    }
    return listeners;
  };
  WebSocketXhr.prototype._handleXhrResponseError = function(xhr) {
    if (xhr.status === 404) {
      this.close();
      return;
    }
    this._fireEventListeners("error", {
      target: this,
      status: xhr.status,
      message: "error from XHR invocation: " + xhr.statusText
    });
    return Weinre.logError(("error from XHR invocation: " + xhr.status + ": ") + xhr.statusText);
  };
  WebSocketXhr.prototype._xhr = function(url, method, data, handler) {
    var xhr;
    if (null === handler) {
      throw new Ex(arguments, "handler must not be null");
    }
    xhr = new XMLHttpRequest();
    xhr.httpSocket = this;
    xhr.httpSocketHandler = handler;
    xhr.onreadystatechange = _xhrEventHandler;
    HookLib.ignoreHooks(function() {
      return xhr.open(method, url, true);
    });
    xhr.setRequestHeader("Content-Type", "text/plain");
    return xhr.send(data);
  };
  return WebSocketXhr;
})();
_xhrEventHandler = function(event) {
  var xhr;
  xhr = event.target;
  if (xhr.readyState !== 4) {
    return;
  }
  return xhr.httpSocketHandler.call(xhr.httpSocket, xhr);
};
require("../common/MethodNamer").setNamesForClass(module.exports);
}});
