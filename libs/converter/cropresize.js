'use strict';

/** @module pictor.converter.cropresize */

var
    util = require('util'),
    _ = require('lodash'),
    gm = require('./gm-q')(require('gm')),
    Converter = require('./converter'),
    debug = require('debug')('pictor:converter:cropresize'),
    DEBUG = debug.enabled;

function CropResizeConverter(config) {
    CropResizeConverter.super_.apply(this, arguments);
    DEBUG && debug('create cropresize converter: ', this.config);
}
util.inherits(CropResizeConverter, Converter);

CropResizeConverter.prototype.getVariation = function (opts) {
    return 'cropresize_' + ['w', 'h', 'x', 'y', 'nw', 'nh', 'flags', 'c'].map(function (key) {
        return opts[key];
    }).join('_');
};

/**
 * crop and resize image
 *
 * @param {*} [opts]
 * @param {string|stream|buffer} opts.src
 * @param {string|stream|buffer} opts.dst
 * @param {number} [opts.w=''] crop width
 * @param {number} [opts.h=''] crop height
 * @param {number} [opts.x=0] crop left
 * @param {number} [opts.y=0] crop top
 * @param {number} [opts.nw=''] resize width
 * @param {number} [opts.nh=''] resize height
 * @param {string} [opts.flags=''] resize flags
 * @param {number} [opts.c=0] max color of output image.
 * @returns {promise}
 */
CropResizeConverter.prototype.convert = function (opts) {
    DEBUG && debug('cropResize', opts);
    var src = opts.src,
        dst = opts.dst,
        w = opts.w || '',
        h = opts.h || '',
        x = opts.x || 0,
        y = opts.y || 0,
        nw = opts.nw || '',
        nh = opts.nh || '',
        flags = opts.flags,
        c = opts.c;
    var cmd = gm(src).strip()
        .crop(w, h, x, y)
        .resize(nw, nh, flags);
    (c > 0) && cmd.colors(c);
    return cmd.writeQ(dst)
        .fail(Converter.reject);
};

module.exports = CropResizeConverter;
