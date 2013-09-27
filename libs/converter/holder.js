'use strict';

var
  util = require('util'),
  _ = require('lodash'),
  Q = require('q'),
  gm = require('gm'),
  converter = require('./converter'),
  DEF_HOLDER_OPTS = {background: '#eee', foreground: '#aaa', font: '/Library/Fonts/Impact.ttf', size: 12},
  debug = require('debug')('pictor:converter:holder'),
  DEBUG = debug.enabled;

/**
 * create a placeholder image.
 *
 * @param {string} dst
 * @param {number} w
 * @param {number} h
 * @param {*} [opts]
 * @param {string} [opts.background='#eee']: rgb hex
 * @param {string} [opts.foreground='#aaa']: rgb hex
 * @param {string} [opts.font='/Library/Fonts/Impact.ttf']
 * @param {string} [opts.text='WIDTHxHEIGHT']
 * @param {number} [opts.size=12]
 * @returns {promise} success or not
 */
function holder(dst, w, h, opts) {
  opts = _.defaults(opts || {}, DEF_HOLDER_OPTS);
  console.log('holder opts:', opts);
  var cmd = gm(w, h, opts.background).stroke().fill(opts.foreground);
  // XXX: graphicsmagick should be build with freetype and/or ghostscript.
  //var size = Math.max(opts.size, Math.floor(Math.min(w, h) / 8));
  //var text = opts.text || (w + 'x' + h);
  //cmd.font(opts.font, size).drawText(0, 0, text, 'center');
  return Q.ninvoke(cmd, 'write', dst);
}

//
//
//

function HolderConverter(config) {
  HolderConverter.super_.apply(this, arguments);
  DEBUG && debug('create holder converter: ', config);
}
util.inherits(HolderConverter, converter.Converter);

HolderConverter.prototype.getVariation = function (opts) {
  return 'holder_' + (opts.w || '') + 'x' + (opts.h || '');
};

HolderConverter.prototype.convert = function (opts) {
  return holder(opts.dst, opts.w, opts.h);
};

module.exports = HolderConverter;
