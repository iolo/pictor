'use strict';

var
  util = require('util'),
  Q = require('q'),
  gm = require('gm'),
  converter = require('./converter'),
  debug = require('debug')('pictor:converter:holder'),
  DEBUG = debug.enabled;

/**
 * create a placeholder image.
 *
 * `opts` contains:
 *
 *    - {string} [background='#eee']: rgb hex
 *    - {string} [foreground='#aaa']: rgb hex
 *    - {string} [font='/Library/Fonts/Impact.ttf']
 *    - {string} [text='WIDTHxHEIGHT']
 *    - {number} [size=12]
 *
 * @param {string} dst
 * @param {number} w
 * @param {number} h
 * @param {object} [opts]
 * @returns {promise} success or not
 */
function holder(dst, w, h, opts) {
  opts = _.defaults(opts || {}, {background: '#eee', foreground: '#aaa', font: '/Library/Fonts/Impact.ttf', size: 12});
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
