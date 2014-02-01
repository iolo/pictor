'use strict';

var
    util = require('util'),
    Q = require('q'),
    _ = require('lodash'),
    gm = require('gm'),
    converter = require('./converter'),
    DEF_CONFIG = {
        options: {
            brightness: 20,
            saturation: 50,
            gravity: 'center',
            quality: 100
        }
    },
    debug = require('debug')('pictor:converter:convert'),
    DEBUG = debug.enabled;

/**
 * create watermarked image.
 *
 * @param {string} src
 * @param {string} dst
 * @param {*} opts
 * @param {string} opts.watermark
 * @param {number} opts.brightness
 * @param {number} opts.saturation
 * @param {number} opts.quality
 * @param {string} opts.gravity
 * @returns {promise} success or not
 */
function watermark(src, dst, opts) {
    //var cmd = gm(src).noProfile();
    //return Q.ninvoke(cmd, 'write', dst);
    var exec = require('child_process').exec;
    var command = [
        'gm',
        'composite',
        '-watermark', opts.brightness + 'x' + opts.saturation,
        '-gravity', opts.gravity,
        '-quality', opts.quality,
        opts.watermark,
        src,
        dst
    ];
    var d = Q.defer();
    exec(command.join(' '), function (err, stdout, stderr) {
        DEBUG && debug('exec command', command, 'err:', err, 'stdout:', stdout, 'stderr:', stderr);
        if (err) {
            return d.reject(err);
        }
        return d.resolve(true);
    });
    return d.promise;
}

//
//
//

function WatermarkConverter(config) {
    _.defaults(config, DEF_CONFIG);
    WatermarkConverter.super_.apply(this, arguments);
    DEBUG && debug('create watercolor converter: ', this.config);
}
util.inherits(WatermarkConverter, converter.Converter);

WatermarkConverter.prototype.getParamNames = function () {
    return _.keys(DEF_CONFIG.options);
};

WatermarkConverter.prototype.getVariation = function (opts) {
    opts = _.defaults(opts, this.config.options);
    return 'watermark_' + opts.brightness + 'x' + opts.saturation + '_' + opts.gravity + '_' + opts.quality;
};

WatermarkConverter.prototype.convert = function (opts) {
    opts = _.defaults(opts, this.config.options);
    return watermark(opts.src, opts.dst, opts);
};

module.exports = WatermarkConverter;
