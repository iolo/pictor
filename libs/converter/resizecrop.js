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
    //return ['nw', 'nh', 'w', 'h', 'x', 'y', 'c'];
    return 'resizecrop_' + (opts.nw || '') + 'x' + (opts.nh || '') + '_' + (opts.w || '') + 'x' + (opts.h || '') + '_' + (opts.x || '') + '_' + (opts.y || '') + '_' + (opts.c || '');
};

/**
 * resize and crop an image.
 *
 * @param {*} [opts]
 * @param {string|stream|buffer} opts.src
 * @param {string|stream|buffer} opts.dst
 * @param {number} opts.nw
 * @param {number} opts.nh
 * @param {string} opts.flags
 * @param {number} opts.w
 * @param {number} opts.h
 * @param {number} opts.x
 * @param {number} opts.y
 * @param {number} opts.c
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
        c = opts.c;
    var cmd = gm(src).strip()
        .resize(nw, nh, flags)
        .crop(w, h, x, y);
    (c > 0) && cmd.colors(c);
    return cmd.writeQ(dst)
        .fail(Converter.reject);
};

module.exports = ResizeCropConverter;
