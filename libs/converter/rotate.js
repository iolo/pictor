'use strict';

/** @module pictor.converter.rotate */

var
    util = require('util'),
    Q = require('q'),
    gm = require('gm'),
    Converter = require('./converter'),
    debug = require('debug')('pictor:converter:rotate'),
    DEBUG = debug.enabled;

/**
 * rotate image.
 *
 * @param {string} src
 * @param {string} dst
 * @param {number} degree
 * @returns {promise} success or not
 */
function rotate(src, dst, degree) {
    DEBUG && debug('rotate', src, '-->', dst, degree);
    var cmd = gm(src).noProfile().rotate('black', degree);
    return Q.ninvoke(cmd, 'write', dst);
}

//
//
//

function RotateConverter(config) {
    RotateConverter.super_.apply(this, arguments);
    DEBUG && debug('create rotate converter: ', config);
}
util.inherits(RotateConverter, Converter);

RotateConverter.prototype.getVariation = function (opts) {
    //return ['degree'];
    return 'rotate_' + (opts.degree || '');
};

/**
 * rotate an image.
 *
 * @param {object} opts
 * @param {string} opts.src
 * @param {string} opts.dst
 * @param {number} [opts.degree]
 * @returns {promise}
 */
RotateConverter.prototype.convert = function (opts) {
    return rotate(opts.src, opts.dst, opts.degree);
};

module.exports = RotateConverter;
