'use strict';

/** @module pictor.converter.holder */

var
    util = require('util'),
    _ = require('lodash'),
    Q = require('q'),
    gm = require('gm'),
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

/**
 * create a placeholder image.
 *
 * @param {string} dst
 * @param {number} w
 * @param {number} h
 * @param {*} [opts]
 * @param {string} [opts.background='#eee']: rgb hex
 * @param {string} [opts.foreground='#aaa']: rgb hex
 * @param {string} [opts.font='']
 * @param {string} [opts.text='WIDTHxHEIGHT']
 * @param {number} [opts.size=12]
 * @param {string} [opts.gravity='center']
 * @returns {promise} success or not
 */
function holder(dst, w, h, opts) {
    DEBUG && debug('holder opts:', opts);
    var cmd = gm(w, h, opts.background).stroke().fill(opts.foreground);
    // XXX: graphicsmagick should be build with freetype and/or ghostscript.
    if (opts.font) {
        var size = Math.max(opts.size, Math.floor(Math.min(w, h) / 8));
        var text = opts.text || (w + 'x' + h);
        cmd.font(opts.font, size).drawText(0, 0, text, opts.gravity);
    }
    return Q.ninvoke(cmd, 'write', dst);
}

//
//
//

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

HolderConverter.prototype.convert = function (opts) {
    return holder(opts.dst, opts.w, opts.h, this.config);
};

module.exports = HolderConverter;
