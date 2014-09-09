'use strict';

/** @module pictor.converter.optimize */

var
    util = require('util'),
    path = require('path'),
    _ = require('lodash'),
    Q = require('q'),
    gm = require('./gm-q')(require('gm')),
    Converter = require('./converter'),
    execFile = Q.denodeify(require('child_process').execFile),
    debug = require('debug')('pictor:converter:optimize'),
    DEBUG = debug.enabled;

function OptimizeConverter(config) {
    OptimizeConverter.super_.apply(this, arguments);
    DEBUG && debug('create optimize converter: ', config);
}
util.inherits(OptimizeConverter, Converter);

OptimizeConverter.prototype.getVariation = function (opts) {
    return 'optimize';
};

OptimizeConverter.prototype.getExtension = function (opts) {
    // always same to src format!
    return path.extname(opts.src).substring(1);
};

/**
 * optimize the given image.
 *
 * @param {*} [opts]
 * @param {string|stream|buffer} opts.src
 * @param {string|stream|buffer} opts.dst
 * @returns {promise} success or not
 */
OptimizeConverter.prototype.convert = function (opts) {
    DEBUG && debug('optimize', opts);
    var src = opts.src,
        dst = opts.dst;
    return gm(src).formatQ()
        .then(function (format) {
            switch (format) {
                case 'JPEG':
                    var jpegtranPath = require('jpegtran-bin').path;
                    return execFile(jpegtranPath, ['-copy', 'none', '-optimize', '-outfile', dst, src]);
                case 'PNG':
                    var optipngPath = require('optipng-bin').path;
                    return execFile(optipngPath, ['-quiet', '-force', '-strip', 'all', '-out', dst, src]);
                case 'GIF':
                    var gifsiclePath = require('gifsicle').path;
                    return execFile(gifsiclePath, ['--careful', '-w', '-o', dst, src]);
            }
            // unsupported format!?
            // simply convert it without profile data!
            //return convert(src, dst);
            throw new Converter.Error('unsupported_format', 400);
        })
        .fail(Converter.reject);
};

module.exports = OptimizeConverter;
