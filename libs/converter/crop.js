'use strict';

/** @module pictor.converter.crop */

var
    util = require('util'),
    Q = require('q'),
    gm = require('gm'),
    Converter = require('./converter'),
    debug = require('debug')('pictor:converter:crop'),
    DEBUG = debug.enabled;

/**
 * crop image.
 *
 * @param {string} src
 * @param {string} dst
 * @param {number} w
 * @param {number} h
 * @param {number} x
 * @param {number} y
 * @param {number} c
 * @returns {promise} success or not
 */
function crop(src, dst, w, h, x, y, c) {
    DEBUG && debug('crop', src, '-->', dst, w, h, x, y, c);
    var cmd = gm(src).noProfile().crop(w || '', h || '', x || 0, y || 0);
    (c > 0) && cmd.colors(c);
    return Q.ninvoke(cmd, 'write', dst);
}

//
//
//

function CropConverter(config) {
    CropConverter.super_.apply(this, arguments);
    DEBUG && debug('create crop converter: ', config);
}
util.inherits(CropConverter, Converter);

CropConverter.prototype.getVariation = function (opts) {
    //return ['w', 'h', 'x', 'y', 'c'];
    return 'crop_' + (opts.w || '') + 'x' + (opts.h || '') + '_' + (opts.x || '') + '_' + (opts.y || '') + '_' + (opts.c || '');
};

/**
 * crop an image.
 *
 * `opts` contains:
 *    - {number} w
 *    - {number} h
 *    - {number} x
 *    - {number} y
 *    - {number} c
 * @param {object} opts
 * @returns {promise}
 */
CropConverter.prototype.convert = function (opts) {
    return crop(opts.src, opts.dst, opts.w, opts.h, opts.x, opts.y, opts.c);
};

module.exports = CropConverter;
