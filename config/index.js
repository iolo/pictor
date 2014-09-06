var
    util = require('util'),
    _ = require('lodash'),
    debug = require('debug')('pictor:config'),
    DEBUG = debug.enabled;

function load() {
    var
        defPath = './defaults',
        defConfig = require(defPath),
        env = process.env.PICTOR_ENV || process.env.NODE_ENV || 'development',
        envPath = process.env.PICTOR_CONFIG || ('./' + env),
        envConfig = require(envPath),
        config = _.merge(defConfig, envConfig);
    DEBUG && debug('load configuration for', env, 'from', envPath);
    DEBUG && debug(util.inspect(config, {depth: null, colors: true}));
    return config;
}

function merge(config) {
    // merged config will be accumulated because module is singleton
    return _.merge(module.exports, config);
}

// require('../config'); // merge 함수 + init()의 결과 -> 결과는 module itself -> 전역 singleton
// require('../config')(opts); // merge(opts) -> 결과는 역시 module itself -> 전역 singleton
module.exports = _.extend(merge, load());



