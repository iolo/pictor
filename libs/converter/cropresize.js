'use strict';

var
  util = require('util'),
  Q = require('q'),
  gm = require('gm'),
  converter = require('./converter'),
  DEF_CONFIG = {
    options: {
      w: '',
      h: '',
      x: 0,
      y: 0, rw: '',
      rh: '',
      flags: ''
    }
  },
  debug = require('debug')('pictor:converter:cropresize'),
  DEBUG = debug.enabled;

/**
 * crop and resize image
 *
 * @param {string} src
 * @param {string} dst
 * @param {number} w crop width
 * @param {number} h crop height
 * @param {number} x crop left
 * @param {number} y crop top
 * @param {number} rw resize width
 * @param {number} rh resize height
 * @param {string} flags resize flags
 * @returns {promise} success or not
 */
function cropResize(src, dst, w, h, x, y, rw, rh, flags) {
  DEBUG && debug('cropResize', src, '-->', dst, w, h, x, y, rw, rh, flags);
  var cmd = gm(src).noProfile().crop(w, h, x, y).resize(rw, rh, flags);
  return Q.ninvoke(cmd, 'write', dst);
}

//
//
//

function CropResizeConverter(config) {
  _.defaults(config, DEF_CONFIG);
  CropResizeConverter.super_.apply(this, arguments);
  DEBUG && debug('create cropresize converter: ', this.config);
}
util.inherits(CropResizeConverter, converter.Converter);

CropResizeConverter.prototype.getParamNames = function () {
  return _.keys(DEF_CONFIG.options);
};

CropResizeConverter.prototype.getVariation = function (opts) {
  opts = _.defaults(opts, this.config.options);
  return 'cropresize_' + opts.w + 'x' + opts.h + '_' + opts.x + '_' + opts.y + '_' + opts.rw + 'x' + opts.rh + '_' + opts.flags;
};

/**
 * resize and crop an image.
 *
 * @param {object} opts
 * @param {number} opts.w
 * @param {number} opts.h
 * @param {number} opts.x
 * @param {number} opts.y
 * @param {number} opts.rw
 * @param {number} opts.rh
 * @param {string} opts.flags
 * @returns {promise}
 */
CropResizeConverter.prototype.convert = function (opts) {
  opts = _.defaults(opts, this.config.options);
  return cropResize(opts.src, opts.dst, opts.w, opts.h, opts.x, opts.y, opts.rw, opts.rh, opts.flags);
};

module.exports = CropResizeConverter;
