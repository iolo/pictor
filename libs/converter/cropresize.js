'use strict';

/** @module pictor.converter.cropresize */

var
    util = require('util'),
    _ = require('lodash'),
    gm = require('./gm-q')(require('gm')),
    Converter = require('./converter'),
    DEF_CONFIG = {
        options: {
            w: '',
            h: '',
            x: 0,
            y: 0,
            nw: '',
            nh: '',
            flags: '',
            c: 0
        }
    },
    debug = require('debug')('pictor:converter:cropresize'),
    DEBUG = debug.enabled;

function CropResizeConverter(config) {
    _.defaults(config, DEF_CONFIG);
    CropResizeConverter.super_.apply(this, arguments);
    DEBUG && debug('create cropresize converter: ', this.config);
}
util.inherits(CropResizeConverter, Converter);

CropResizeConverter.prototype.getVariation = function (opts) {
    //return _.keys(DEF_CONFIG.options);
    opts = _.defaults(opts, this.config.options);
    return 'cropresize_' + opts.w + 'x' + opts.h + '_' + opts.x + '_' + opts.y + '_' + opts.nw + 'x' + opts.nh + '_' + opts.flags + '_' + opts.c;
};

/**
 * crop and resize image
 *
 * @param {*} [opts]
 * @param {string|stream|buffer} opts.src
 * @param {string|stream|buffer} opts.dst
 * @param {number} opts.w crop width
 * @param {number} opts.h crop height
 * @param {number} opts.x crop left
 * @param {number} opts.y crop top
 * @param {number} opts.nw resize width
 * @param {number} opts.nh resize height
 * @param {string} opts.flags resize flags
 * @param {number} opts.c
 * @returns {promise}
 */
CropResizeConverter.prototype.convert = function (opts) {
    opts = _.defaults(opts, this.config.options);
    DEBUG && debug('cropResize', opts);
    var src = opts.src,
        dst = opts.dst,
        w = opts.w || '',
        h = opts.h || '',
        x = opts.x || 0,
        y = opts.y || 0,
        nw = opts.nw || '',
        nh = opts.nh || '',
        flags = opts.flags,
        c = opts.c;
    var cmd = gm(src).strip()
        .crop(w, h, x, y)
        .resize(nw, nh, flags);
    (c > 0) && cmd.colors(c);
    return cmd.writeQ(dst)
        .fail(Converter.reject);
};

module.exports = CropResizeConverter;
