'use strict';

/** @module pictor.converter.watermark */

var
    util = require('util'),
    Q = require('q'),
    _ = require('lodash'),
    gm = require('./gm-q')(require('gm')),
    Converter = require('./converter'),
    DEF_CONFIG = {
        image: null, // required but exclusive with text
        gravity: 'Center',
        compose: 'Over',
        text: null, // required but exclusive  with image
        color: '#fff',
        font: '',
        size: 12
    },
    debug = require('debug')('pictor:converter:watermark'),
    DEBUG = debug.enabled;

function WatermarkConverter(config) {
    _.defaults(config, DEF_CONFIG);
    WatermarkConverter.super_.apply(this, arguments);
    DEBUG && debug('create watercolor converter: ', this.config);
}
util.inherits(WatermarkConverter, Converter);

WatermarkConverter.prototype.getVariation = function (opts) {
    return 'watermark_' + opts.gravity + '_' + opts.image + '_' + opts.compose + '_' + opts.text + '_' + opts.color + '_' + opts.font + '_' + opts.size;
};

/**
 * create watermarked image.
 *
 * @param {*} [opts]
 * @param {string|stream|buffer} opts.src
 * @param {string|stream|buffer} opts.dst
 * @param {string} [opts.gravity='Center']
 * @param {string} [opts.image]
 * @param {string} [opts.compose='Over'] Over, In, Out, Atop, Xor, Plus, Minus, Add, Subtract, Difference, Divide, Multiply, Bumpmap, Copy, Copy...
 * @param {string} [opts.text]
 * @param {string} [opts.font]
 * @param {string} [opts.size=12]
 * @param {string} [opts.color]
 * @returns {promise}
 */
WatermarkConverter.prototype.convert = function (opts) {
    opts = _.defaults(opts, this.config);
    DEBUG && debug('watermark', opts);
    var src = opts.src,
        dst = opts.dst,
        gravity = opts.gravity,
        image = opts.image,
        text = opts.text;
    var cmd;
    if (image) {
        var compose = opts.compose;
        cmd = gm()
            .command('composite')
            .gravity(gravity)
            .in('-compose', compose, image, src);
    } else if (text) {
        // XXX: graphicsmagick should be build with freetype and/or ghostscript.
        var font = opts.font;
        var size = opts.size;
        cmd = gm(src).strip()
            .font(font, size)
            .drawText(0, 0, text, gravity);
    } else {
        return Converter.reject(new Converter.Error('invalid_param', 400));
    }
    return cmd.writeQ(dst)
        .fail(Converter.reject);
};

module.exports = WatermarkConverter;
