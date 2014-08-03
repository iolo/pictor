'use strict';

var
    util = require('util'),
    Q = require('q'),
    gm = require('gm'),
    converter = require('./converter'),
    debug = require('debug')('pictor:converter:thumbnail'),
    DEBUG = debug.enabled;

/**
 * create thumbnail image.
 *
 * this will keep aspect-ratio and auto-rotate by exif orientation.
 *
 * @param {string} src
 * @param {string} dst
 * @param {number} w
 * @param {number} h
 * @param {number} c
 * @returns {promise} success or not
 */
function thumbnail(src, dst, w, h, c) {
    DEBUG && debug('thumbnail', src, '-->', dst, w, h, c);
    w = w || h || '';
    h = h || w || '';
    // see http://www.imagemagick.org/Usage/resize/#fill
    var cmd = gm(src).noProfile().autoOrient().thumbnail(w, h + '^').gravity('Center').extent(w, h);
    (c > 0) && cmd.colors(c);
    return Q.ninvoke(cmd, 'write', dst);
}

//
//
//

function ThumbnailConverter(config) {
    ThumbnailConverter.super_.apply(this, arguments);
    DEBUG && debug('create thumbnail converter: ', config);
}
util.inherits(ThumbnailConverter, converter.Converter);

ThumbnailConverter.prototype.getParamNames = function () {
    return ['w', 'h', 'c'];
};

ThumbnailConverter.prototype.getVariation = function (opts) {
    return 'thumbnail_' + (opts.w || '') + 'x' + (opts.h || '') + '_' + (opts.c||'');
};

/**
 * thumbnail an image.
 *
 * @param {object} opts
 * @param {string|stream} opts.src
 * @param {string|stream} opts.dst
 * @param {number} opts.w
 * @param {number} opts.h
 * @param {number} opts.c
 * @returns {promise}
 */
ThumbnailConverter.prototype.convert = function (opts) {
    return thumbnail(opts.src, opts.dst, opts.w, opts.h, opts.c);
};

module.exports = ThumbnailConverter;
