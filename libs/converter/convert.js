'use strict';

var
  util = require('util'),
  converter = require('./converter'),
  imgutils = require('../imgutils'),
  debug = require('debug')('pictor:converter:convert'),
  DEBUG = debug.enabled;

function ConvertConverter(config) {
  ConvertConverter.super_.apply(this, arguments);
  DEBUG && debug('create convert converter: ', config);
}
util.inherits(ConvertConverter, converter.Converter);

ConvertConverter.prototype.getVariation = function (opts) {
  return 'convert';
};

ConvertConverter.prototype.convert = function (opts) {
  return imgutils.convert(opts.src, opts.dst);
};

module.exports = ConvertConverter;
