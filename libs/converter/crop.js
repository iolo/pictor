'use strict';

var
  util = require('util'),
  converter = require('./converter'),
  imgutils = require('../imgutils'),
  debug = require('debug')('pictor:converter:crop'),
  DEBUG = debug.enabled;

function CropConverter(config) {
  CropConverter.super_.apply(this, arguments);
  DEBUG && debug('create crop converter: ', config);
}
util.inherits(CropConverter, converter.Converter);

CropConverter.prototype.getVariation = function (opts) {
  return 'crop_' + (opts.w || '') + 'x' + (opts.h || '') + '_' + (opts.x || '') + '_' + (opts.y || '');
};

CropConverter.prototype.convert = function (opts) {
  return imgutils.crop(opts.src, opts.dst, opts.w, opts.h, opts.x, opts.y);
};

module.exports = CropConverter;
