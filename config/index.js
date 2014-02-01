'use strict';

var
    _ = require('lodash'),
    debug = require('debug')('pictor:config'),
    DEBUG = debug.enabled;

function loadConfig() {
    var env = process.env.PICTOR_CONFIG || ('./' + (process.env.PICTOR_ENV || process.env.NODE_ENV || 'development'));
    var defConfig = require('./defaults');
    var envConfig = require(env);
    var config = _.merge(defConfig, envConfig);
    DEBUG && debug('load config: env=', env, 'config=', require('util').inspect(config, {depth: null}));
    return config;
}

module.exports = loadConfig();

