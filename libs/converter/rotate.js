'use strict';

/** @module pictor.converter.rotate */

var
    util = require('util'),
    Q = require('q'),
    gm = require('./gm-q')(require('gm')),
    Converter = require('./converter'),
    debug = require('debug')('pictor:converter:rotate'),
    DEBUG = debug.enabled;

function RotateConverter(config) {
    RotateConverter.super_.apply(this, arguments);
    DEBUG && debug('create rotate converter: ', config);
}
util.inherits(RotateConverter, Converter);

RotateConverter.prototype.getVariation = function (opts) {
    return 'rotate_' + (opts.background || '') + '_' + (opts.degree || '');
};

/**
 * rotate an image.
 *
 * @param {*} [opts]
 * @param {string|stream|buffer} opts.src
 * @param {string|stream|buffer} opts.dst
 * @param {string} [opts.background='black']
 * @param {number} [opts.degree=0]
 * @returns {promise}
 */
RotateConverter.prototype.convert = function (opts) {
    DEBUG && debug('rotate', opts);
    var src = opts.src,
        dst = opts.dst,
        background = opts.background || 'black',
        degree = opts.degree || 0;
    return gm(src).strip()
        .rotate(background, degree)
        .writeQ(dst)
        .fail(Converter.reject);
};

module.exports = RotateConverter;
