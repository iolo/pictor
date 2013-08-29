'use strict';

var
  util = require('util'),
  converter = require('./converter'),
  imgutils = require('../imgutils'),
  debug = require('debug')('pictor:converter:holder'),
  DEBUG = debug.enabled;

function HolderConverter(config) {
  HolderConverter.super_.apply(this, arguments);
  DEBUG && debug('create holder converter: ', config);
}
util.inherits(HolderConverter, converter.Converter);

HolderConverter.prototype.getVariation = function (opts) {
  return 'holder_' + (opts.w || '') + 'x' + (opts.h || '');
};

HolderConverter.prototype.convert = function (opts) {
  return imgutils.holder(opts.dst, opts.w, opts.h);
};

module.exports = HolderConverter;
