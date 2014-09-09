'use strict';

/** @module pictor.converter.exif */

var
    util = require('util'),
    FS = require('q-io/fs'),
    gm = require('./gm-q')(require('gm')),
    Converter = require('./converter'),
    debug = require('debug')('pictor:converter:exif'),
    DEBUG = debug.enabled;

function ExifConverter(config) {
    ExifConverter.super_.apply(this, arguments);
    DEBUG && debug('create exif converter: ', config);
}
util.inherits(ExifConverter, Converter);

ExifConverter.prototype.getVariation = function (opts) {
    return 'exif';
};

ExifConverter.prototype.getExtension = function (opts) {
    // always json!
    return 'json';
};

/**
 * get image exif data.
 *
 * result contains:
 *    - {string} Make
 *    - {string} Model
 *    - {string} Orientation
 *    - ...
 *
 * @param {*} [opts]
 * @param {string|stream|buffer} opts.src
 * @param {string|stream|buffer} opts.dst
 * @returns {promise}
 */
ExifConverter.prototype.convert = function (opts) {
    DEBUG && debug('exif', opts);
    var src = opts.src,
        dst = opts.dst;
    return gm(src).identifyQ()
        .then(function (result) {
            return FS.write(dst, JSON.stringify(result['Profile-EXIF'] || {}));
        })
        .fail(Converter.reject);
};

module.exports = ExifConverter;
