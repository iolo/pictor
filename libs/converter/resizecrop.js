'use strict';

var
  util = require('util'),
  Q = require('q'),
  gm = require('gm'),
  converter = require('./converter'),
  debug = require('debug')('pictor:converter:resizecrop'),
  DEBUG = debug.enabled;

/**
 * resize and crop image.
 *
 * @param {string} src
 * @param {string} dst
 * @param {number} nw
 * @param {number} nh
 * @param {number} w
 * @param {number} h
 * @param {number} x
 * @param {number} y
 * @param {string} flags
 * @returns {promise} success or not
 */
function resizeCrop(src, dst, nw, nh, w, h, x, y) {
  DEBUG && debug('resizeCrop', src, '-->', dst, nw, nh, w, h, x, y);
  var cmd = gm(src).noProfile().resize(nw||'',nh||'','!').crop(w || '', h || '', x || 0, y || 0);
  return Q.ninvoke(cmd, 'write', dst);
}

//
//
//

function ResizeCropConverter(config) {
  ResizeCropConverter.super_.apply(this, arguments);
  DEBUG && debug('create crop converter: ', config);
}
util.inherits(ResizeCropConverter, converter.Converter);

ResizeCropConverter.prototype.getParamNames = function () {
  return ['nw', 'nh', 'w', 'h', 'x', 'y', 'format'];
};

ResizeCropConverter.prototype.getVariation = function (opts) {
  return 'resizecrop_' + (opts.nw||'') + 'x' + (opts.nh||'') + '_' + (opts.w || '') + 'x' + (opts.h || '') + '_' + (opts.x || '') + '_' + (opts.y || '');
};

/**
 * resize and crop an image.
 *
 * `opts` contains:
 *    - {number} nw
 *    - {number} nw
 *    - {number} w
 *    - {number} h
 *    - {number} x
 *    - {number} y
 * @param {object} opts
 * @returns {promise}
 */
ResizeCropConverter.prototype.convert = function (opts) {
  return resizeCrop(opts.src, opts.dst, opts.nw, opts.nh, opts.w, opts.h, opts.x, opts.y);
};

module.exports = ResizeCropConverter;
