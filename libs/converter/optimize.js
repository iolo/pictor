'use strict';

var
  util = require('util'),
  path = require('path'),
  converter = require('./converter'),
  imgutils = require('../imgutils'),
  debug = require('debug')('pictor:converter:optimize'),
  DEBUG = debug.enabled;

function OptimizeConverter(config) {
  OptimizeConverter.super_.apply(this, arguments);
  DEBUG && debug('create optimize converter: ', config);
}
util.inherits(OptimizeConverter, converter.Converter);

OptimizeConverter.prototype.getVariation = function (opts) {
  return 'optimize';
};

//OptimizeConverter.prototype.getExtension = function (opts) {
//  // always same to src format!
//  return path.extname(opts.src).substring(1);
//};

OptimizeConverter.prototype.convert = function (opts) {
  return imgutils.optimize(opts.src, opts.dst);
};

module.exports = OptimizeConverter;
