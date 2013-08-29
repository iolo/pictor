'use strict';

var
  util = require('util'),
  converter = require('./converter'),
  imgutils = require('../imgutils'),
  debug = require('debug')('pictor:converter:resize'),
  DEBUG = debug.enabled;

function ResizeConverter(config) {
  ResizeConverter.super_.apply(this, arguments);
  DEBUG && debug('create resize converter: ', config);
}
util.inherits(ResizeConverter, converter.Converter);

ResizeConverter.prototype.getVariation = function (opts) {
  return 'resize_' + (opts.w || '') + 'x' + (opts.h || '') + '_' + (opts.flags || '');
};

ResizeConverter.prototype.convert = function (opts) {
  return imgutils.resize(opts.src, opts.dst, opts.w, opts.h, opts.flags);
};

module.exports = ResizeConverter;
