'use strict';

/** @module pictor.converter.meta */

var
    util = require('util'),
    _ = require('lodash'),
    Q = require('q'),
    FS = require('q-io/fs'),
    gm = require('gm'),
    Converter = require('./converter'),
    DEF_CONFIG = {
        format: '{"width":%w, "height":%h, "size":"%b", "colors":%k, "depth":%q, "format":"%m"}\n'
    },
    debug = require('debug')('pictor:converter:meta'),
    DEBUG = debug.enabled;

/**
 * get image meta data.
 *
 * result contains:
 *    - {number} width
 *    - {number} height
 *    - {number} colors
 *    - {number} depth
 *    - {string} format
 *    - {string} size
 *
 * @param {string} src
 * @returns {promise} meta data or error
 */
function meta(src) {
    var cmd = gm(src);
    return Q.ninvoke(cmd, 'identify', DEF_CONFIG.format)
        .then(function (result) {
            // NOTE: take the first one for multi frame images
            return JSON.parse(result.split('\n')[0]);
        });
}

//
//
//

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

MetaConverter.prototype.convert = function (opts) {
    return meta(opts.src)
        .then(function (meta) {
            return FS.write(opts.dst, JSON.stringify(meta));
        })
        .fail(Converter.reject);
};

module.exports = MetaConverter;
