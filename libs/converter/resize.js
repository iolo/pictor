'use strict';

var
  util = require('util'),
  converter = require('converter'),
  imgutils = require('../imgutils'),
  debug = require('debug')('pictor:converter:resize'),
  DEBUG = debug.enabled;

function ResizeConverter(config) {
  ResizeConverter.super_.apply(this, arguments);
  DEBUG && debug('create resize converter: ', config);
}
util.inherits(ResizeConverter, converter.Converter);

ResizeConverter.prototype.convert = function (src, dst, opts) {
  return imgutils.resize(src, dst, opts.w, opts.h, opts.flags);
};

module.exports = ResizeConverter;
