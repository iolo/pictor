'use strict';

var
  fs = require('fs'),
  Q = require('q'),
  _ = require('lodash'),
  gm = require('gm'),
  debug = require('debug')('pictor:imgutils'),
  DEBUG = debug.enabled;

/**
 * convert image format.
 *
 * @param {string} src
 * @param {string} dst
 * @returns {promise} success or not
 */
function convert(src, dst) {
  var cmd = gm(src).noProfile();
  return Q.ninvoke(cmd, 'write', dst);
}

/**
 * resize image.
 *
 * `flags` are one of the followings:
 *    - '!': force. ignore aspect ratio.
 *    - '%': percent.
 *    - '^': fill area.
 *    - '<': enlarge.
 *    - '>': shrink.
 *    - '@': pixel.
 *
 * @param {string} src
 * @param {string} dst
 * @param {number} w
 * @param {number} h
 * @param {string} flags
 * @returns {promise} success or not
 */
function resize(src, dst, w, h, flags) {
  DEBUG && debug('resize', src, '-->', dst, w, h);
  var cmd = gm(src).noProfile().resize(w || '', h || '', flags);
  return Q.ninvoke(cmd, 'write', dst);
}

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

/**
 * get image format.
 *
 * @param {string} src
 * @returns {promise} 'JPEG', 'PNG', 'GIF' or error
 */
function format(src) {
  var cmd = gm(src);
  return Q.ninvoke(cmd, 'format');
}

/**
 * get image width and height.
 *
 * result contains:
 *    - {number} width
 *    - {number} height
 * @param {string} src
 * @returns {promise} size or error
 */
function size(src) {
  var cmd = gm(src);
  return Q.ninvoke(cmd, 'size');
}

/**
 * get image meta data.
 *
 * result contains:
 *    - {number} width
 *    - {number} height
 *    - {number} colors
 *    - {number} depth
 *    - {string} format
 *    - {string} size
 *
 * @param {string} src
 * @returns {promise} meta data or error
 */
function meta(src) {
  var cmd = gm(src);
  return Q.ninvoke(cmd, 'identify', '{"width":%w, "height":%h, "size":"%b", "colors":%k, "depth":%q, "format":"%m"}\n')
    .then(function (result) {
      // NOTE: take the first one for multi frame images
      return JSON.parse(result.split('\n')[0]);
    });
}

/**
 * get image exif data.
 *
 * result contains:
 *    - {string} Make
 *    - {string} Model
 *    - {string} Orientation
 *    - ...
 *
 * @param {string} src
 * @returns {promise} exit data or error
 */
function exif(src) {
  var cmd = gm(src);
  return Q.ninvoke(cmd, 'identify')
    .then(function (result) {
      return result['Profile-EXIF'] || {};
//    return Object.keys(result).reduce(function (prev, curr) {
//      if (curr.indexOf('EXIF:') > 0) {
//        prev[curr] = result[curr];
//      }
//      return prev;
//    }, {});
    });
}

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

/**
 * optimize the given image.
 *
 * @param {string} src
 * @param {string} dst
 * @returns {promise} success or not
 */
function optimize(src, dst) {
  var execFile = require('child_process').execFile;
  return format(src)
    .then(function (format) {
      switch (format) {
        case 'JPEG':
          var jpegtran = require('jpegtran-bin').path;
          return Q.nfcall(execFile, jpegtran, ['-copy', 'none', '-optimize', '-outfile', dst, src]);
        case 'PNG':
          var optipng = require('optipng-bin').path;
          return Q.nfcall(execFile, optipng, ['-quiet', '-force', '-strip', 'all', '-out', dst, src]);
        case 'GIF':
          var gifsicle = require('gifsicle').path;
          return Q.nfcall(execFile, gifsicle, ['--careful', '-w', '-o', dst, src]);
      }
      // unsupported format!?
      // simply convert it without profile data!
      return convert(src, dst);
    });
}

module.exports = {
  convert: convert,
  resize: resize,
  crop: crop,
  thumbnail: thumbnail,
  format: format,
  size: size,
  meta: meta,
  exif: exif,
  holder: holder,
  optimize: optimize
};
