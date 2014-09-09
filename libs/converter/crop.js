'use strict';

/** @module pictor.converter.crop */

var
    util = require('util'),
    Q = require('q'),
    gm = require('./gm-q')(require('gm')),
    Converter = require('./converter'),
    debug = require('debug')('pictor:converter:crop'),
    DEBUG = debug.enabled;

function CropConverter(config) {
    CropConverter.super_.apply(this, arguments);
    DEBUG && debug('create crop converter: ', this.config);
}
util.inherits(CropConverter, Converter);

CropConverter.prototype.getVariation = function (opts) {
    return 'crop_' + ['w', 'h', 'x', 'y', 'c'].map(function (key) {
        return opts[key];
    }).join('_');
};

/**
 * crop an image.
 *
 * @param {*} opts
 * @param {string|stream|buffer} opts.src
 * @param {string|stream|buffer} opts.dst
 * @param {number} [opts.w=''] crop width
 * @param {number} [opts.h=''] crop height
 * @param {number} [opts.x=0] crop left
 * @param {number} [opts.y=0] crop top
 * @param {number} [opts.c=0] max color of output image.
 * @returns {promise}
 */
CropConverter.prototype.convert = function (opts) {
    DEBUG && debug('crop', opts);
    var src = opts.src,
        dst = opts.dst,
        w = opts.w || '',
        h = opts.h || '',
        x = opts.x || 0,
        y = opts.y || 0,
        c = opts.c || 0;
    var cmd = gm(src).strip()
        .crop(w, h, x, y);
    (c > 0) && cmd.colors(c);
    return cmd.writeQ(dst)
        .fail(Converter.reject);
};

module.exports = CropConverter;
