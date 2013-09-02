'use strict';

var
  util = require('util'),
  Q = require('q'),
  gm = require('gm'),
  converter = require('./converter'),
  debug = require('debug')('pictor:converter:crop'),
  DEBUG = debug.enabled;

/**
 * crop image.
 *
 * @param {string} src
 * @param {string} dst
 * @param {number} w
 * @param {number} h
 * @param {number} x
 * @param {number} y
 * @param {string} flags
 * @returns {promise} success or not
 */
function crop(src, dst, w, h, x, y) {
  DEBUG && debug('crop', src, '-->', dst, w, h, x, y);
  var cmd = gm(src).noProfile().crop(w || '', h || '', x || 0, y || 0);
  return Q.ninvoke(cmd, 'write', dst);
}

//
//
//

function CropConverter(config) {
  CropConverter.super_.apply(this, arguments);
  DEBUG && debug('create crop converter: ', config);
}
util.inherits(CropConverter, converter.Converter);

CropConverter.prototype.getVariation = function (opts) {
  return 'crop_' + (opts.w || '') + 'x' + (opts.h || '') + '_' + (opts.x || '') + '_' + (opts.y || '');
};

/**
 * crop an image.
 *
 * `opts` contains:
 *    - {number} w
 *    - {number} h
 *    - {number} x
 *    - {number} y
 * @param {object} opts
 * @returns {promise}
 */
CropConverter.prototype.convert = function (opts) {
  return crop(opts.src, opts.dst, opts.w, opts.h, opts.x, opts.y);
};

module.exports = CropConverter;
