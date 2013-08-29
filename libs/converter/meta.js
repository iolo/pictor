'use strict';

var
  util = require('util'),
  FS = require('q-io/fs'),
  converter = require('./converter'),
  imgutils = require('../imgutils'),
  debug = require('debug')('pictor:converter:meta'),
  DEBUG = debug.enabled;

function MetaConverter(config) {
  MetaConverter.super_.apply(this, arguments);
  DEBUG && debug('create meta converter: ', config);
}
util.inherits(MetaConverter, converter.Converter);

MetaConverter.prototype.getVariation = function (opts) {
  return 'meta';
};

MetaConverter.prototype.getExtension = function (opts) {
  // always json!
  return 'json';
};

MetaConverter.prototype.convert = function (opts) {
  return imgutils.meta(opts.src)
    .then(function (meta) {
      return FS.write(opts.dst, JSON.stringify(meta));
    });
};

module.exports = MetaConverter;
