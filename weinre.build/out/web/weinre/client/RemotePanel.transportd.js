;require.define({"weinre/client/RemotePanel": function(require, exports, module) { var Binding, ClientList, ConnectorList, DT, RemotePanel, TargetList, Weinre;
var __hasProp = Object.prototype.hasOwnProperty, __extends = function(child, parent) {
  for (var key in parent) { if (__hasProp.call(parent, key)) child[key] = parent[key]; }
  function ctor() { this.constructor = child; }
  ctor.prototype = parent.prototype;
  child.prototype = new ctor;
  child.__super__ = parent.prototype;
  return child;
};
Binding = require('../common/Binding');
Weinre = require('../common/Weinre');
ConnectorList = require('./ConnectorList');
DT = require('./DOMTemplates');
WebInspector.Panel.prototype.constructor = WebInspector.Panel;
module.exports = RemotePanel = (function() {
  __extends(RemotePanel, WebInspector.Panel);
  RemotePanel.prototype.__defineGetter__("toolbarItemClass", function() {
    return "remote";
  });
  RemotePanel.prototype.__defineGetter__("toolbarItemLabel", function() {
    return "Remote";
  });
  RemotePanel.prototype.__defineGetter__("statusBarItems", function() {
    return [];
  });
  RemotePanel.prototype.__defineGetter__("defaultFocusedElement", function() {
    return this.contentElement;
  });
  function RemotePanel() {
    RemotePanel.__super__.constructor.call(this, "remote");
    this.initialize();
  }
  RemotePanel.prototype.initialize = function() {
    var div, icon;
    div = DT.DIV();
    div.style.position = "absolute";
    div.style.top = "1em";
    div.style.right = "1em";
    div.style.left = "1em";
    div.style.bottom = "1em";
    div.style.overflow = "auto";
    icon = DT.IMG({
      src: "../images/weinre-icon-128x128.png"
    });
    icon.style.float = "right";
    div.appendChild(icon);
    this.targetList = new TargetList();
    this.clientList = new ClientList();
    div.appendChild(this.targetList.getElement());
    div.appendChild(this.clientList.getElement());
    this.serverProperties = DT.DIV({
      $className: "weinreServerProperties"
    });
    div.appendChild(DT.H1("Server Properties"));
    div.appendChild(this.serverProperties);
    this.element.appendChild(div);
    return this.reset();
  };
  RemotePanel.prototype.addClient = function(client) {
    return this.clientList.add(client);
  };
  RemotePanel.prototype.addTarget = function(target) {
    return this.targetList.add(target);
  };
  RemotePanel.prototype.getTarget = function(channel) {
    return this.targetList.get(channel);
  };
  RemotePanel.prototype.removeClient = function(channel) {
    return this.clientList.remove(channel);
  };
  RemotePanel.prototype.removeTarget = function(channel) {
    return this.targetList.remove(channel);
  };
  RemotePanel.prototype.setCurrentClient = function(channel) {
    return this.clientList.setCurrent(channel);
  };
  RemotePanel.prototype.setCurrentTarget = function(channel) {
    return this.targetList.setCurrent(channel);
  };
  RemotePanel.prototype.setClientState = function(channel, state) {
    return this.clientList.setState(channel, state);
  };
  RemotePanel.prototype.setTargetState = function(channel, state) {
    return this.targetList.setState(channel, state);
  };
  RemotePanel.prototype.getNewestTargetChannel = function(ignoring) {
    return this.targetList.getNewestConnectorChannel(ignoring);
  };
  RemotePanel.prototype.afterInitialConnection = function() {
    return this.clientList.afterInitialConnection();
  };
  RemotePanel.prototype.reset = function() {
    this.clientList.removeAll();
    this.targetList.removeAll();
    Weinre.WeinreClientCommands.getTargets(Binding(this, "cb_getTargets"));
    return Weinre.WeinreClientCommands.getClients(Binding(this, "cb_getClients"));
  };
  RemotePanel.prototype.connectionClosed = function() {
    this.clientList.removeAll();
    return this.targetList.removeAll();
  };
  RemotePanel.prototype.cb_getTargets = function(targets) {
    var newestTargetChannel, target, _i, _len;
    for (_i = 0, _len = targets.length; _i < _len; _i++) {
      target = targets[_i];
      this.addTarget(target);
    }
    if (!Weinre.client.autoConnect()) {
      return;
    }
    newestTargetChannel = this.getNewestTargetChannel();
    if (!newestTargetChannel) {
      return;
    }
    if (!Weinre.messageDispatcher) {
      return;
    }
    return Weinre.WeinreClientCommands.connectTarget(Weinre.messageDispatcher.channel, newestTargetChannel);
  };
  RemotePanel.prototype.cb_getClients = function(clients) {
    var client, _i, _len, _results;
    _results = [];
    for (_i = 0, _len = clients.length; _i < _len; _i++) {
      client = clients[_i];
      _results.push(this.addClient(client));
    }
    return _results;
  };
  RemotePanel.prototype.show = function() {
    return RemotePanel.__super__.show.call(this);
  };
  RemotePanel.prototype.hide = function() {
    return RemotePanel.__super__.hide.call(this);
  };
  RemotePanel.prototype.setServerProperties = function(properties) {
    var aVal, finalVal, key, keys, table, val, _i, _j, _len, _len2;
    table = "<table>";
    keys = [];
    for (key in properties) {
      keys.push(key);
    }
    keys = keys.sort();
    for (_i = 0, _len = keys.length; _i < _len; _i++) {
      key = keys[_i];
      val = properties[key];
      if (typeof val === "string") {
        val = val.escapeHTML();
      } else {
        finalVal = "";
        for (_j = 0, _len2 = val.length; _j < _len2; _j++) {
          aVal = val[_j];
          finalVal += "<li>" + aVal.escapeHTML();
        }
        val = "<ul>" + finalVal + "</ul>";
      }
      table += ("<tr class='weinre-normal-text-size'><td valign='top'>" + (key.escapeHTML()) + ": <td>") + val;
    }
    table += "</table>";
    return this.serverProperties.innerHTML = table;
  };
  return RemotePanel;
})();
TargetList = (function() {
  __extends(TargetList, ConnectorList);
  function TargetList() {
    TargetList.__super__.constructor.call(this, "Targets");
  }
  TargetList.prototype.getListItem = function(target) {
    var item, self, text;
    self = this;
    text = target.hostName + (" [channel: " + target.channel + " id: " + target.id + "]") + " - " + target.url;
    item = DT.LI({
      $connectorChannel: target.channel
    }, text);
    item.addStyleClass("weinre-connector-item");
    item.addStyleClass("target");
    item.addEventListener("click", (function(e) {
      return self.connectToTarget(target.channel, e);
    }), false);
    target.element = item;
    return item;
  };
  TargetList.prototype.connectToTarget = function(targetChannel, event) {
    var target;
    if (event) {
      event.preventDefault();
      event.stopPropagation();
    }
    target = this.connectors[targetChannel];
    if (!target) {
      return false;
    }
    if (target.closed) {
      return false;
    }
    Weinre.WeinreClientCommands.connectTarget(Weinre.messageDispatcher.channel, targetChannel);
    return false;
  };
  return TargetList;
})();
ClientList = (function() {
  __extends(ClientList, ConnectorList);
  function ClientList() {
    ClientList.__super__.constructor.call(this, "Clients");
    this.noneItem.innerHTML = "Waiting for connection...";
  }
  ClientList.prototype.afterInitialConnection = function() {
    this.noneItem.innerHTML = "Connection lost, reload this page to reconnect.";
    return this.noneItem.addStyleClass("error");
  };
  ClientList.prototype.getListItem = function(client) {
    var item, text;
    text = client.hostName + (" [channel: " + client.channel + " id: " + client.id + "]");
    item = DT.LI({
      $connectorChannel: client.channel
    }, text);
    item.addStyleClass("weinre-connector-item");
    item.addStyleClass("client");
    if (Weinre.messageDispatcher) {
      if (client.channel === Weinre.messageDispatcher.channel) {
        item.addStyleClass("current");
      }
    }
    client.element = item;
    return item;
  };
  return ClientList;
})();
require("../common/MethodNamer").setNamesForClass(module.exports);
}});
