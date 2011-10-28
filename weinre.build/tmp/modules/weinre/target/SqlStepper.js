var Binding, SqlStepper, executeSql, ourErrorCallback, runStep;
Binding = require('../common/Binding');
module.exports = SqlStepper = (function() {
  function SqlStepper(steps) {
    var context;
    if (!(this instanceof SqlStepper)) {
      return new SqlStepper(steps);
    }
    this.__context = {};
    context = this.__context;
    context.steps = steps;
  }
  SqlStepper.prototype.run = function(db, errorCallback) {
    var context;
    context = this.__context;
    if (context.hasBeenRun) {
      throw new Ex(arguments, "stepper has already been run");
    }
    context.hasBeenRun = true;
    context.db = db;
    context.errorCallback = errorCallback;
    context.nextStep = 0;
    context.ourErrorCallback = new Binding(this, ourErrorCallback);
    context.runStep = new Binding(this, runStep);
    this.executeSql = new Binding(this, executeSql);
    return db.transaction(context.runStep);
  };
  SqlStepper.example = function(db, id) {
    var errorCb, step1, step2, stepper;
    step1 = function() {
      return this.executeSql("SELECT name FROM sqlite_master WHERE type='table'");
    };
    step2 = function(resultSet) {
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
      return console.log(("[" + this.id + "] table names: ") + result.join(", "));
    };
    errorCb = function(sqlError) {
      return console.log(("[" + this.id + "] sql error:" + sqlError.code + ": ") + sqlError.message);
    };
    stepper = new SqlStepper([step1, step2]);
    stepper.id = id;
    return stepper.run(db, errorCb);
  };
  return SqlStepper;
})();
executeSql = function(statement, data) {
  var context;
  context = this.__context;
  return context.tx.executeSql(statement, data, context.runStep, context.ourErrorCallback);
};
ourErrorCallback = function(tx, sqlError) {
  var context;
  context = this.__context;
  return context.errorCallback.call(this, sqlError);
};
runStep = function(tx, resultSet) {
  var context, step;
  context = this.__context;
  if (context.nextStep >= context.steps.length) {
    return;
  }
  context.tx = tx;
  context.currentStep = context.nextStep;
  context.nextStep++;
  step = context.steps[context.currentStep];
  return step.call(this, resultSet);
};
require("../common/MethodNamer").setNamesForClass(module.exports);