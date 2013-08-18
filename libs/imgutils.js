var
  Q = require('Q'),
  gm = require('gm'),
  debug = require('debug')('pictor:imgutils'),
  DEBUG = debug.enabled;

/**
 * convert image.
 *
 * `opts` contains:
 *
 *    - {string} [op='convert']: operation. 'crop', 'resize', 'thumbnail', 'convert', ...
 *    - {number} [w=auto]: width for resize/crop
 *    - {number} [h=auto]: height for resize/crop
 *    - {number} [x]: left for crop
 *    - {number} [y]: top for crop
 *    - {string} [flags]: additional flags for resize
 *
 * @param {string} src
 * @param {string} dst
 * @param {object} opts
 * @returns {promise} success or not
 */
function convert(src, dst, opts) {
  DEBUG && debug('convert', src, '-->', dst, opts);
  var cmd = gm(src).noProfile();
  switch (opts.op) {
    case 'crop':
      DEBUG && debug('crop ', opts);
      cmd = cmd.crop(opts.w || opts.h, opts.h || opts.w, opts.x || 0, opts.y || 0);
      break;
    case 'resize':
      DEBUG && debug('resize ', opts);
      cmd = cmd.resize(opts.w || '', opts.h || '', opts.flags);
      break;
    case 'thumbnail':
      DEBUG && debug('thumbnail ', opts);
      cmd = cmd.thumbnail(opts.w || '', opts.h || '');
      break;
    case 'convert':
      DEBUG && debug('convert ', opts);
      break;
    default:
      DEBUG && debug('default -> convert', opts);
      break;
  }
  return Q.ninvoke(cmd, 'write', dst);
}

function convertOpts() {
  return {op: 'convert'};
}

function cropOpts(w, h, x, y, flags) {
  return {op: 'crop', w: w || h, h: h || w, x: x || 0, y: y || 0, flags: flags};
}

function resizeOpts(w, h, flags) {
  return {op: 'resize', w: w || '', h: h || '', flags: flags};
}

function thumbnailOpts(w, h, flags) {
  return {op: 'thumbnail', w: w || '', h: h || '', flags: flags};
}

function resize(src, dst, w, h, flags) {
  DEBUG && debug('resize', src, '-->', dst, w, h);
  var cmd = gm(src).noProfile().resize(w || '', h || '', flags);
  return Q.ninvoke(cmd, 'write', dst);
}

function crop(src, dst, w, h, x, y) {
  DEBUG && debug('crop', src, '-->', dst, w, h, x, y);
  var cmd = gm(src).noProfile().crop(w || '', h || '', x || 0, y || 0);
  return Q.ninvoke(cmd, 'write', dst);
}

function thumbnail(src, dst, w, h) {
  DEBUG && debug('thumbnail', src, '-->', dst, w, h);
  var cmd = gm(src).noProfile().thumbnail(w || '', h || '');
  return Q.ninvoke(cmd, 'write', dst);
}

function identify(src) {
  var cmd = gm(src);
  return Q.ninvoke(cmd, 'identify');
}

function meta(src) {
  var cmd = gm(src).size();
  return Q.ninvoke(cmd, 'identify', '{"width":%w, "height":%h, "size":"%b", "colors":%k, "depth":%q, "format":"%m"}')
    .then(function (result) {
      return JSON.parse(result);
    });
}

function exif(src) {
  return identify(src).then(function (result) {
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
 * create a holder image.
 *
 * `opts` contains:
 *
 *    - {number} [w=auto]: width
 *    - {number} [h=auto]: height
 *    - {string} [background='#eee']: rgb hex
 *    - {string} [foreground='#aaa']: rgb hex
 *    - {string} [font='/Library/Fonts/Impact.ttf']
 *    - {string} [text='WIDTHxHEIGHT']
 *    - {number} [size=12]
 *
 * @param {string} dst
 * @param {object} opts
 * @returns {promise} success or not
 */
function createImage(dst, opts) {
  var w = opts.w || opts.h, h = opts.h || opts.w;
  var background = opts.background || '#eee';
  var foreground = opts.foreground || '#aaa';
  //var font = opts.font || '/Library/Fonts/Impact.ttf';
  //var size = Math.max(opts.size || 12, Math.floor(Math.min(w, h) / 8));
  //var text = opts.text || (w + 'x' + h);
  var cmd = gm(w, h, background).stroke().fill(foreground);
  //.font(font, size).drawText(0, 0, text, 'center');
  return Q.ninvoke(cmd, 'write', dst);
}

module.exports = {
  convert: convert,
  convertOpts: convertOpts,
  cropOpts: cropOpts,
  resizeOpts: resizeOpts,
  thumbnailOpts: thumbnailOpts,
  resize: resize,
  crop: crop,
  thumbnail: thumbnail,
  identify: identify,
  meta: meta,
  exif: exif,
  createImage: createImage
};
