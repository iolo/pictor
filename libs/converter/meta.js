'use strict';

/** @module pictor.converter.meta */

var
    util = require('util'),
    _ = require('lodash'),
    Q = require('q'),
    FS = require('q-io/fs'),
    gm = require('./gm-q')(require('gm')),
    Converter = require('./converter'),
    DEF_CONFIG = {
        format: '{"width":%w, "height":%h, "size":"%b", "colors":%k, "depth":%q, "format":"%m"}\n'
    },
    debug = require('debug')('pictor:converter:meta'),
    DEBUG = debug.enabled;

function MetaConverter(config) {
    _.defaults(config, DEF_CONFIG);
    MetaConverter.super_.apply(this, arguments);
    DEBUG && debug('create meta converter: ', config);
}
util.inherits(MetaConverter, Converter);

MetaConverter.prototype.getVariation = function (opts) {
    return 'meta';
};

MetaConverter.prototype.getExtension = function (opts) {
    // always json!
    return 'json';
};

/**
 * get image meta data.
 *
 * @param {*} [opts]
 * @param {string|stream|buffer} opts.src
 * @param {string|stream|buffer} opts.dst
 * @returns {promise}
 */
MetaConverter.prototype.convert = function (opts) {
    DEBUG && debug('meta', opts);
    var src = opts.src,
        dst = opts.dst;
    return gm(src).identifyQ(DEF_CONFIG.format)
        .then(function (result) {
            // NOTE: take the first one for multi frame images
            return FS.write(dst, result.split('\n')[0]);
        })
        .fail(Converter.reject);
};

module.exports = MetaConverter;
