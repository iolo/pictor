'use strict';

var
    util = require('util'),
    FS = require('q-io/fs'),
    Q = require('q'),
    gm = require('gm'),
    converter = require('./converter'),
    debug = require('debug')('pictor:converter:exif'),
    DEBUG = debug.enabled;

/**
 * get image exif data.
 *
 * result contains:
 *    - {string} Make
 *    - {string} Model
 *    - {string} Orientation
 *    - ...
 *
 * @param {string} src
 * @returns {promise} exit data or error
 */
function exif(src) {
    var cmd = gm(src);
    return Q.ninvoke(cmd, 'identify')
        .then(function (result) {
            return result['Profile-EXIF'] || {};
//    return Object.keys(result).reduce(function (prev, curr) {
//      if (curr.indexOf('EXIF:') > 0) {
//        prev[curr] = result[curr];
//      }
//      return prev;
//    }, {});
        });
}

//
//
//

function ExifConverter(config) {
    ExifConverter.super_.apply(this, arguments);
    DEBUG && debug('create exif converter: ', config);
}
util.inherits(ExifConverter, converter.Converter);

ExifConverter.prototype.getParamNames = function () {
    return [];
};

ExifConverter.prototype.getVariation = function (opts) {
    return 'exif';
};

ExifConverter.prototype.getExtension = function (opts) {
    // always json!
    return 'json';
};

ExifConverter.prototype.convert = function (opts) {
    return exif(opts.src)
        .then(function (exif) {
            var result = (typeof exif === 'object') ? JSON.stringify(exif) : '{}';
            return FS.write(opts.dst, result);
        });
};

module.exports = ExifConverter;
