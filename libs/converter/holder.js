'use strict';

/** @module pictor.converter.holder */

var
    util = require('util'),
    _ = require('lodash'),
    gm = require('./gm-q')(require('gm')),
    Converter = require('./converter'),
    DEF_CONFIG = {
        format: 'jpeg',
        background: '#eee',
        foreground: '#aaa',
        font: '',
        size: 12,
        gravity: 'center'
    },
    debug = require('debug')('pictor:converter:holder'),
    DEBUG = debug.enabled;

function HolderConverter(config) {
    _.defaults(config, DEF_CONFIG);
    HolderConverter.super_.apply(this, arguments);
    DEBUG && debug('create holder converter: ', this.config);
}
util.inherits(HolderConverter, Converter);

HolderConverter.prototype.getVariation = function (opts) {
    return 'holder_' + (opts.w || '') + 'x' + (opts.h || '');
};

HolderConverter.prototype.getExtension = function (opts) {
    return opts.format || this.config.format;
};

/**
 * create a placeholder image.
 *
 * @param {*} [opts]
 * @param {string|stream|buffer} opts.dst
 * @param {number} opts.w
 * @param {number} opts.h
 * @param {string} [opts.background='#eee']: rgb hex
 * @param {string} [opts.foreground='#aaa']: rgb hex
 * @param {string} [opts.font]
 * @param {string} [opts.text='WIDTHxHEIGHT']
 * @param {number} [opts.size=12]
 * @param {string} [opts.gravity='Center']
 * @returns {promise}
 */
HolderConverter.prototype.convert = function (opts) {
    DEBUG && debug('holder', opts);
    var dst = opts.dst,
        w = opts.w || opts.h,
        h = opts.h || opts.w,
        background = opts.background || '#eee',
        foreground = opts.foreground || '#aaa',
        border = opts.border,
        font = opts.font;
    var cmd = gm(w, h, background)
        .fill(foreground);
    if (border) {
        var borderWidth = opts.bw;
        cmd.stroke(border, borderWidth);
    }
    // XXX: graphicsmagick should be build with freetype and/or ghostscript.
    if (font) {
        var text = opts.text || (w + 'x' + h);
        var size = Math.max(opts.size || 12, Math.floor(Math.min(w, h) / 8));
        var gravity = opts.gravity || 'Center';
        cmd.font(font, size).drawText(0, 0, text, gravity);
    }
    return cmd.writeQ(dst)
        .fail(Converter.reject);
};

module.exports = HolderConverter;
