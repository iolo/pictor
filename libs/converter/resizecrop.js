'use strict';

/** @module pictor.converter.resizecrop */

var
    util = require('util'),
    Q = require('q'),
    gm = require('gm'),
    Converter = require('./converter'),
    debug = require('debug')('pictor:converter:resizecrop'),
    DEBUG = debug.enabled;

/**
 * resize and crop image.
 *
 * @param {string} src
 * @param {string} dst
 * @param {number} nw
 * @param {number} nh
 * @param {number} w
 * @param {number} h
 * @param {number} x
 * @param {number} y
 * @param {number} c
 * @returns {promise} success or not
 */
function resizeCrop(src, dst, nw, nh, w, h, x, y, c) {
    DEBUG && debug('resizeCrop', src, '-->', dst, nw, nh, w, h, x, y, c);
    var cmd = gm(src).noProfile().resize(nw || '', nh || '').crop(w || '', h || '', x || 0, y || 0);
    (c > 0) && cmd.colors(c);
    return Q.ninvoke(cmd, 'write', dst);
}

//
//
//

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
 * `opts` contains:
 *    - {number} nw
 *    - {number} nw
 *    - {number} w
 *    - {number} h
 *    - {number} x
 *    - {number} y
 *    - {number} c
 * @param {object} opts
 * @returns {promise}
 */
ResizeCropConverter.prototype.convert = function (opts) {
    return resizeCrop(opts.src, opts.dst, opts.nw, opts.nh, opts.w, opts.h, opts.x, opts.y, opts.c);
};

module.exports = ResizeCropConverter;
