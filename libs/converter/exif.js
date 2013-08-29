'use strict';

var
  util = require('util'),
  FS = require('q-io/fs'),
  converter = require('./converter'),
  imgutils = require('../imgutils'),
  debug = require('debug')('pictor:converter:exif'),
  DEBUG = debug.enabled;

function ExifConverter(config) {
  ExifConverter.super_.apply(this, arguments);
  DEBUG && debug('create exif converter: ', config);
}
util.inherits(ExifConverter, converter.Converter);

ExifConverter.prototype.getVariation = function (opts) {
  return 'exif';
};

ExifConverter.prototype.getExtension = function (opts) {
  // always json!
  return 'json';
};

ExifConverter.prototype.convert = function (opts) {
  return imgutils.exif(opts.src)
    .then(function (exif) {
      return FS.write(opts.dst, JSON.stringify(exif));
    });
};

module.exports = ExifConverter;
