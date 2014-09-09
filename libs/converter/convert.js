'use strict';

/** @module pictor.converter.convert */

var
    util = require('util'),
    Q = require('q'),
    gm = require('gm'),
    Converter = require('./converter'),
    debug = require('debug')('pictor:converter:convert'),
    DEBUG = debug.enabled;

// TODO: support custom effects such as vignette, vintage, softfocus, colorize
// http://www.fmwconcepts.com/imagemagick/
// http://jqmagick.imagemagick.org/
// https://github.com/paulasmuth/

/**
 * convert image format.
 *
 * @param {string} src
 * @param {string} dst
 * @returns {promise} success or not
 */
function convert(src, dst) {
    var cmd = gm(src).noProfile();
    return Q.ninvoke(cmd, 'write', dst);
}

//
//
//

function ConvertConverter(config) {
    ConvertConverter.super_.apply(this, arguments);
    DEBUG && debug('create convert converter: ', config);
}
util.inherits(ConvertConverter, Converter);

ConvertConverter.prototype.getVariation = function (opts) {
    //return ['format'];
    return 'convert';
};

ConvertConverter.prototype.convert = function (opts) {
    return convert(opts.src, opts.dst);
};

module.exports = ConvertConverter;
