'use strict';

var
  util = require('util'),
  Q = require('q'),
  gm = require('gm'),
  converter = require('./converter'),
  debug = require('debug')('pictor:converter:thumbnail'),
  DEBUG = debug.enabled;

/**
 * create thumbnail image.
 *
 * @param {string} src
 * @param {string} dst
 * @param {number} w
 * @param {number} h
 * @returns {promise} success or not
 */
function thumbnail(src, dst, w, h) {
  DEBUG && debug('thumbnail', src, '-->', dst, w, h);
  var cmd = gm(src).noProfile().thumbnail(w || '', h || '');
  return Q.ninvoke(cmd, 'write', dst);
}

//
//
//

function ThumbnailConverter(config) {
  ThumbnailConverter.super_.apply(this, arguments);
  DEBUG && debug('create thumbnail converter: ', config);
}
util.inherits(ThumbnailConverter, converter.Converter);

ThumbnailConverter.prototype.getVariation = function (opts) {
  return 'thumbnail_' + (opts.w || '') + 'x' + (opts.h || '') + '_' + (opts.flags || '!');
};

/**
 * thumbnail an image.
 *
 * `opts` contains:
 *    - {number} w
 *    - {number} h
 * @param {object} opts
 * @returns {promise}
 */
ThumbnailConverter.prototype.convert = function (opts) {
  return thumbnail(opts.src, opts.dst, opts.w, opts.h);
};

module.exports = ThumbnailConverter;
