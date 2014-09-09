'use strict';

/** @module pictor.converter.resizecrop */

var
    util = require('util'),
    Q = require('q'),
    gm = require('./gm-q')(require('gm')),
    Converter = require('./converter'),
    debug = require('debug')('pictor:converter:resizecrop'),
    DEBUG = debug.enabled;

function ResizeCropConverter(config) {
    ResizeCropConverter.super_.apply(this, arguments);
    DEBUG && debug('create crop converter: ', config);
}
util.inherits(ResizeCropConverter, Converter);

ResizeCropConverter.prototype.getVariation = function (opts) {
    return 'resizecrop_' + ['nw', 'nh', 'flags', 'w', 'h', 'x', 'y', 'c'].map(function (key) {
        return opts[key];
    }).join('_');
};

/**
 * resize and crop an image.
 *
 * @param {*} [opts]
 * @param {string|stream|buffer} opts.src
 * @param {string|stream|buffer} opts.dst
 * @param {number} [opts.nw=''] resize width
 * @param {number} [opts.nh=''] resize height
 * @param {string} [opts.flags=''] resize flags
 * @param {number} [opts.w=''] crop width
 * @param {number} [opts.h=''] crop height
 * @param {number} [opts.x=0] crop left
 * @param {number} [opts.y=0] crop top
 * @param {number} [opts.c=0] max color of output image.
 * @returns {promise}
 */
ResizeCropConverter.prototype.convert = function (opts) {
    DEBUG && debug('resizeCrop', opts);
    var src = opts.src,
        dst = opts.dst,
        nw = opts.nw || '',
        nh = opts.nh || '',
        flags = opts.flags || '',
        w = opts.w || '',
        h = opts.h || '',
        x = opts.x || 0,
        y = opts.y || 0,
        c = opts.c || 0;
    var cmd = gm(src).strip()
        .resize(nw, nh, flags)
        .crop(w, h, x, y);
    (c > 0) && cmd.colors(c);
    return cmd.writeQ(dst)
        .fail(Converter.reject);
};

module.exports = ResizeCropConverter;
