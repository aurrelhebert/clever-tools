var _ = require("lodash");
var path = require("path");
var Bacon = require("baconjs");

var Logger = require("../logger.js");

var AppConfig = require("../models/app_configuration.js");
var Addon = require("../models/addon.js");

var colors = require("colors");

var addon = module.exports;

var list = addon.list = function(api, params) {
  var alias = params.options.alias;
  var showAll = params.options["show-all"];

  var s_appData = AppConfig.getAppData(alias);

  var s_addon = s_appData.flatMap(function(appData) {
    return Addon.list(api, appData.app_id, appData.org_id, showAll);
  });

  s_addon.onValue(function(addons) {
    var nameWidth = Math.max.apply(null,   _(addons).pluck("name").filter().pluck("length").value());
    var planWidth = Math.max.apply(null,   _(addons).pluck("plan").pluck("name").pluck("length").value());
    var regionWidth = Math.max.apply(null, _(addons).pluck("region").pluck("length").value());
    var typeWidth = Math.max.apply(null,   _(addons).pluck("provider").pluck("name").pluck("length").value());

    var renderLine = function(addon, showLinked) {
      return (showLinked && addon.isLinked ? '* ' : '  ') +
        '[' + _.padRight(addon.plan.name, planWidth) + ' ' +
              _.padRight(addon.provider.name, typeWidth) + '] ' +
              _.padRight(addon.region, regionWidth) + ' ' +
              _.padRight(addon.name, nameWidth).bold.green + ' ' +
              addon.id;
    };

    Logger.println(addons.map(function(addon) {
      return renderLine(addon, showAll);
    }).join('\n'));
  });

  s_addon.onError(Logger.error);
};

var create = addon.create = function(api, params) {
  Logger.println("Create addon");
};

var link = addon.link = function(api, params) {
  var alias = params.options.alias;
  var addonId = params.args[0];

  var s_appData = AppConfig.getAppData(alias);

  var s_result = s_appData.flatMap(function(appData) {
    return Addon.link(api, appData.app_id, appData.org_id, addonId);
  });

  s_result.onValue(function() {
    Logger.println("Addon " + addonId + " sucessfully linked");
  });
  s_result.onError(Logger.error);
};

var unlink = addon.unlink = function(api, params) {
  var alias = params.options.alias;
  var addonId = params.args[0];

  var s_appData = AppConfig.getAppData(alias);

  var s_result = s_appData.flatMap(function(appData) {
    return Addon.unlink(api, appData.app_id, appData.org_id, addonId);
  });

  s_result.onValue(function() {
    Logger.println("Addon " + addonId + " sucessfully unlinked");
  });
  s_result.onError(Logger.error);
};
