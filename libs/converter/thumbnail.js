'use strict';

/** @module pictor.converter.thumbnail */

var
    util = require('util'),
    Q = require('q'),
    gm = require('./gm-q')(require('gm')),
    Converter = require('./converter'),
    debug = require('debug')('pictor:converter:thumbnail'),
    DEBUG = debug.enabled;

function ThumbnailConverter(config) {
    ThumbnailConverter.super_.apply(this, arguments);
    DEBUG && debug('create thumbnail converter: ', config);
}
util.inherits(ThumbnailConverter, Converter);

ThumbnailConverter.prototype.getVariation = function (opts) {
    //return ['w', 'h', 'c'];
    return 'thumbnail_' + (opts.w || '') + 'x' + (opts.h || '') + '_' + (opts.c || '');
};

/**
 * create thumbnail image.
 *
 * this will keep aspect-ratio and auto-rotate by exif orientation.
 *
 * @param {*} [opts]
 * @param {string|stream|buffer} opts.src
 * @param {string|stream|buffer} opts.dst
 * @param {number} opts.w
 * @param {number} opts.h
 * @param {number} opts.c
 * @returns {promise}
 */
ThumbnailConverter.prototype.convert = function (opts) {
    DEBUG && debug('thumbnail', opts);
    var src = opts.src,
        dst = opts.dst,
        w = opts.w || opts.h || '',
        h = opts.h || opts.w || '',
        c = opts.c || 0;
    // see http://www.imagemagick.org/Usage/resize/#fill
    var cmd = gm(src).strip()
        .autoOrient()
        .thumbnail(w, h + '^')
        .gravity('Center')
        .extent(w, h);
    (c > 0) && cmd.colors(c);
    return cmd.writeQ(dst)
        .fail(Converter.reject);
};

module.exports = ThumbnailConverter;
