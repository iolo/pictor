'use strict';

/** @module pictor.converter.convert */

var
    util = require('util'),
    gm = require('./gm-q')(require('gm')),
    Converter = require('./converter'),
    debug = require('debug')('pictor:converter:convert'),
    DEBUG = debug.enabled;

// TODO: support custom effects such as vignette, vintage, softfocus, colorize
// http://www.fmwconcepts.com/imagemagick/
// http://jqmagick.imagemagick.org/
// https://github.com/paulasmuth/

function ConvertConverter(config) {
    ConvertConverter.super_.apply(this, arguments);
    DEBUG && debug('create convert converter: ', config);
}
util.inherits(ConvertConverter, Converter);

ConvertConverter.prototype.getVariation = function (opts) {
    //return ['format'];
    return 'convert';
};

/**
 * convert image format.
 *
 * @param {*} [opts]
 * @param {string|stream|buffer} opts.src
 * @param {string|stream|buffer} opts.dst
 * @returns {promise}
 */
ConvertConverter.prototype.convert = function (opts) {
    DEBUG && debug('convert', opts);
    var src = opts.src,
        dst = opts.dst;
    return gm(src).strip()
        .writeQ(dst)
        .fail(Converter.reject);
};

module.exports = ConvertConverter;
