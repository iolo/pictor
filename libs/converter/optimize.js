'use strict';

var
  util = require('util'),
  path = require('path'),
  Q = require('q'),
  gm = require('gm'),
  converter = require('./converter'),
  debug = require('debug')('pictor:converter:optimize'),
  DEBUG = debug.enabled;

/**
 * optimize the given image.
 *
 * @param {string} src
 * @param {string} dst
 * @returns {promise} success or not
 */
function optimize(src, dst) {
  var execFile = require('child_process').execFile;
  var cmd = gm(src);
  return Q.ninvoke(cmdkj, 'format')
    .then(function (format) {
      switch (format) {
        case 'JPEG':
          var jpegtran = require('jpegtran-bin').path;
          return Q.nfcall(execFile, jpegtran, ['-copy', 'none', '-optimize', '-outfile', dst, src]);
        case 'PNG':
          var optipng = require('optipng-bin').path;
          return Q.nfcall(execFile, optipng, ['-quiet', '-force', '-strip', 'all', '-out', dst, src]);
        case 'GIF':
          var gifsicle = require('gifsicle').path;
          return Q.nfcall(execFile, gifsicle, ['--careful', '-w', '-o', dst, src]);
      }
      // unsupported format!?
      // simply convert it without profile data!
      return convert(src, dst);
    });
}

//
//
//

function OptimizeConverter(config) {
  OptimizeConverter.super_.apply(this, arguments);
  DEBUG && debug('create optimize converter: ', config);
}
util.inherits(OptimizeConverter, converter.Converter);

OptimizeConverter.prototype.getVariation = function (opts) {
  return 'optimize';
};

OptimizeConverter.prototype.getExtension = function (opts) {
  // always same to src format!
  return path.extname(opts.src).substring(1);
};

OptimizeConverter.prototype.convert = function (opts) {
  return optimize(opts.src, opts.dst);
};

module.exports = OptimizeConverter;
