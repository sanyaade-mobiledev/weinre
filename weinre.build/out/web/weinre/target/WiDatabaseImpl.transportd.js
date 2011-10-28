;require.define({"weinre/target/WiDatabaseImpl": function(require, exports, module) { var HookSites, IDGenerator, SqlStepper, Weinre, WiDatabaseImpl, dbAdd, dbById, dbRecordById, dbRecordByName, executeSQL_error, executeSQL_step_1, executeSQL_step_2, getTableNames_step_1, getTableNames_step_2, id2db, logSqlError, name2db;
Weinre = require('../common/Weinre');
IDGenerator = require('../common/IDGenerator');
HookSites = require('./HookSites');
SqlStepper = require('./SqlStepper');
id2db = {};
name2db = {};
module.exports = WiDatabaseImpl = (function() {
  function WiDatabaseImpl() {
    if (!window.openDatabase) {
      return;
    }
    HookSites.window_openDatabase.addHooks({
      after: function(receiver, args, db) {
        var name, version;
        if (!db) {
          return;
        }
        name = args[0];
        version = args[1];
        return dbAdd(db, name, version);
      }
    });
  }
  WiDatabaseImpl.getDatabases = function() {
    var id, result;
    result = [];
    for (id in id2db) {
      result.push(id2db[id]);
    }
    return result;
  };
  WiDatabaseImpl.prototype.getDatabaseTableNames = function(databaseId, callback) {
    var db, stepper;
    db = dbById(databaseId);
    if (!db) {
      return;
    }
    stepper = SqlStepper([getTableNames_step_1, getTableNames_step_2]);
    stepper.callback = callback;
    return stepper.run(db, logSqlError);
  };
  WiDatabaseImpl.prototype.executeSQL = function(databaseId, query, callback) {
    var db, stepper, txid;
    db = dbById(databaseId);
    if (!db) {
      return;
    }
    txid = Weinre.targetDescription.channel + "-" + IDGenerator.next();
    stepper = SqlStepper([executeSQL_step_1, executeSQL_step_2]);
    stepper.txid = txid;
    stepper.query = query;
    stepper.callback = callback;
    stepper.run(db, executeSQL_error);
    if (callback) {
      return Weinre.WeinreTargetCommands.sendClientCallback(callback, [true, txid]);
    }
  };
  return WiDatabaseImpl;
})();
logSqlError = function(sqlError) {
  return console.log(("SQL Error " + sqlError.code + ": ") + sqlError.message);
};
getTableNames_step_1 = function() {
  return this.executeSql("SELECT name FROM sqlite_master WHERE type='table'");
};
getTableNames_step_2 = function(resultSet) {
  var i, name, result, rows;
  rows = resultSet.rows;
  result = [];
  i = 0;
  while (i < rows.length) {
    name = rows.item(i).name;
    if (name === "__WebKitDatabaseInfoTable__") {
      i++;
      continue;
    }
    result.push(name);
    i++;
  }
  return Weinre.WeinreTargetCommands.sendClientCallback(this.callback, [result]);
};
executeSQL_step_1 = function() {
  return this.executeSql(this.query);
};
executeSQL_step_2 = function(resultSet) {
  var columnNames, i, j, propName, row, rows, values;
  columnNames = [];
  values = [];
  rows = resultSet.rows;
  i = 0;
  while (i < rows.length) {
    row = rows.item(i);
    if (i === 0) {
      for (propName in row) {
        columnNames.push(propName);
      }
    }
    j = 0;
    while (j < columnNames.length) {
      values.push(row[columnNames[j]]);
      j++;
    }
    i++;
  }
  return Weinre.wi.DatabaseNotify.sqlTransactionSucceeded(this.txid, columnNames, values);
};
executeSQL_error = function(sqlError) {
  var error;
  error = {
    code: sqlError.code,
    message: sqlError.message
  };
  return Weinre.wi.DatabaseNotify.sqlTransactionFailed(this.txid, error);
};
dbById = function(id) {
  var record;
  record = id2db[id];
  if (!record) {
    return null;
  }
  return record.db;
};
dbRecordById = function(id) {
  return id2db[id];
};
dbRecordByName = function(name) {
  return name2db[name];
};
dbAdd = function(db, name, version) {
  var payload, record;
  record = dbRecordByName(name);
  if (record) {
    return record;
  }
  record = {};
  record.id = IDGenerator.next();
  record.domain = window.location.origin;
  record.name = name;
  record.version = version;
  record.db = db;
  id2db[record.id] = record;
  name2db[name] = record;
  payload = {};
  payload.id = record.id;
  payload.domain = record.domain;
  payload.name = name;
  payload.version = version;
  return Weinre.WeinreExtraTargetEvents.databaseOpened(payload);
};
require("../common/MethodNamer").setNamesForClass(module.exports);
}});
