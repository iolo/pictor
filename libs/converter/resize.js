'use strict';

/** @module pictor.converter.resize */

var
    util = require('util'),
    Q = require('q'),
    gm = require('./gm-q')(require('gm')),
    Converter = require('./converter'),
    debug = require('debug')('pictor:converter:resize'),
    DEBUG = debug.enabled;

function ResizeConverter(config) {
    ResizeConverter.super_.apply(this, arguments);
    DEBUG && debug('create resize converter: ', config);
}
util.inherits(ResizeConverter, Converter);

ResizeConverter.prototype.getVariation = function (opts) {
    //return ['w', 'h', 'flags', 'c'];
    return 'resize_' + (opts.w || '') + 'x' + (opts.h || '') + '_' + (opts.flags || '') + '_' + (opts.c || '');
};

/**
 * resize an image.
 *
 * `flags` are one of the followings:
 *    - '!': force. ignore aspect ratio.
 *    - '%': percent.
 *    - '^': fill area.
 *    - '<': enlarge.
 *    - '>': shrink.
 *    - '@': pixel.
 *
 * @param {*} [opts]
 * @param {string|stream|buffer} opts.src
 * @param {string|stream|buffer} opts.dst
 * @param {number} opts.w
 * @param {number} opts.h
 * @param {string} opts.flags
 * @param {number} opts.c
 * @returns {promise}
 */
ResizeConverter.prototype.convert = function (opts) {
    DEBUG && debug('resize', opts);
    var src = opts.src,
        dst = opts.dst,
        w = opts.w || '',
        h = opts.h || '',
        flags = opts.flags,
        c = opts.c;
    var cmd = gm(src).strip()
        .resize(w, h, flags);
    (c > 0) && cmd.colors(c);
    return cmd.writeQ(dst)
        .fail(Converter.reject);
};

module.exports = ResizeConverter;
