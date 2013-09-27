'use strict';

var
  path = require('path'),
  fs = require('fs'),
  stream = require('stream'),
  _ = require('lodash'),
  Q = require('q'),
  FS = require('q-io/fs'),
  storage = require('./storage'),
  converter = require('./converter'),
  debug = require('debug')('pictor:main'),
  DEBUG = debug.enabled;

var
  tempDir = '/tmp/pictor/temp',
  presets = {
    xxs: {w: 16},
    xs: {w: 24},
    s: {w: 32},
    m: {w: 48},
    l: {w: 64},
    xl: {w: 128},
    xxl: {w: 256}
  },
  converters = {},
  dataStorage,
  cacheStorage;

//var presets = { // see http://trend21c.tistory.com/m/1521
//  IPHONE: [57, 57], //아이폰	57 x 57
//  IPHONE_2X: [114, 114], //아이폰(레티나)	114 x 114
//  IPAD: [72, 72], //아이패드	72 x 72
//  IPAD_2X: [144, 144], //아이패드(레티나)	144 x 144
//  APPSTORE: [512, 512], //앱스토어	1024 x 1024
//  APPSTORE_2X: [1024, 1024],
//  IPHONE_SMALL: [29, 29], //스팟라이트, 아이패드 세팅	29 x 29
//  IPHONE_SMALL_2X: [58, 58], //스팟라이트(레티나), 아이패드 세팅(레티나)	58 x 58
//  IPAD_SMALL: [50, 50], //아이패드 스팟라이트	50 x 50
//  IPAD_SMALL_2x: [100, 100], //아이패드 스팟라이트(레티나)	100 x 100
//  IPHONE_SSHOT: [320, 480],
//  IPHONE_SSHOT_2X: [640, 960],
//  IPHONE_SSHOT_5: [640, 1136],
//  IPAD_SSHOT_P: [768, 1004],
//  IPAD_SSHOT_L: [1024, 748],
//  IPAD_SSHOT_2X_P: [1536, 2008],
//  IPAD_SSHOT_2X_L: [2048, 1496],
//  LDPI: [36, 36], // android ldpi 36x36
//  MDPI: [48, 48], // android mdpi 48x48
//  HDPI: [72, 72], // android hdpi 72x72
//  XHDPI: [96, 96], // android xhdpi 96x96
//  XXHDPI: [144, 144], //
//  GOOGLE_PLAY: [512, 512],
//  FB_MINI: [16, 16], // facebook primary	16 x 16
//  FB_PROFILE: [75, 75], // facebook primary	75 x 75
//  FB_LO: [64, 64], // facebook low resolution	64 x 64
//  FB_MD: [96, 96], // facebook meduim resolution	96 x 96
//  FB_HI: [128, 128], // facebook high resolution	128 x 128
//  FB_OG: [200, 200], // facebook opengraph	200 x 200
//  FB_COVER: [851, 315],
//  FB_TL_ICON: [111, 74],
//  FB_TL_PROFILE: [180, 180],
//  FB_TL_PROFILE_SMALL: [32, 32],
//  TW_COVER: [1252 , 626],
//  TW_ICON_LARGEST: [500, 500],
//  TW_ICON_LARGE: [73, 73],
//  TW_ICON: [48, 48],
//  TW_ICON_SMALL: [31, 31]
//};
//

var DEF_EXTENSION = '.bin';
var DEF_MIME_TYPE = 'application/octet-stream';

var IMAGE_EXTENSIONS = {
  'image/png': 'png',
  'image/jpeg': 'jpg',
  'image/pjpeg': 'jpg',
  'image/gif': 'gif'
};

var IMAGE_MIME_TYPES = {
  'png': 'image/png',
  'jpg': 'image/jpeg',
  'jpeg': 'image/jpeg',
  'gif': 'image/gif'
};

function getExtension(mimeType) {
  return IMAGE_EXTENSIONS[mimeType] || DEF_EXTENSION;
}

function getMimeType(ext) {
  return IMAGE_MIME_TYPES[ext] || DEF_MIME_TYPE;
}

function getTempPath(ext) {
  return path.join(tempDir, _.uniqueId('pictor_') + '.' + (ext || DEF_EXTENSION));
}

//
// CRUD operations for common files
//

/**
 * put a file.
 *
 * delete the old file and all its variants.
 *
 * @param {string} id
 * @param {string} filePath
 * @returns {promise}
 */
function putFile(id, filePath) {
  return cacheStorage.deleteFile(_getVariantId(id))
    .fail(function () {
      //if(err instanceof NotFoundError) { return true; } else throw err;
      return true;
    })
    .then(function () {
      // XXX: handle stream
      if (filePath instanceof stream.Stream) {
        var d = Q.defer();
        var tempFilePath = _.uniqueId('pictor_upload_temp_');
        fs.createWriteStream(tempFilePath).pipe(filePath)
          .on('error', function (err) {
            return d.reject(err);
          })
          .on('end', function () {
            return dataStorage.putFile(id, tempFilePath);
            // TODO: delete tempFilePath
          });
        return d.promise;
      }
      return dataStorage.putFile(id, filePath);
    })
    .then(function (result) {
      // XXX:
      result.id = id;
      return result;
    });
}

/**
 * get a file.
 *
 * @param {string} id
 * @returns {promise} file, url or stream
 */
function getFile(id) {
  return dataStorage.getFile(id)
    .then(function (result) {
      // XXX:
      result.id = id;
      return result;
    });
}

/**
 * delete a file and its variants.
 *
 * @param {string} id
 * @returns {promise} success or not
 */
function deleteFile(id) {
  return cacheStorage.deleteFile(_getVariantId(id))
    .fail(function () {
      //if(err instanceof NotFoundError) { return true; } else throw err;
      return true;
    })
    .then(function () {
      return dataStorage.deleteFile(id);
    });
}

function convertFile(opts) {
  var converter = converters[opts.converter || 'convert'];
  if (!converter) {
    throw 'param not match';
  }
  console.log('convertFile:', opts);
  var ext = converter.getExtension(opts);
  var variantId = _getVariantId(opts.src, converter.getVariation(opts), ext);
  return cacheStorage.getFile(variantId)
    .fail(function () {
      // dst not in cache:
      // 1. get src from data
      return dataStorage.getFile(opts.src)
        .then(function (src) {
          // 2. convert src to temp
          opts.src = src.file || src.stream;
          opts.dst = getTempPath(ext);
          return converter.convert(opts);
        })
        .then(function () {
          // 2. put temp into dst
          return cacheStorage.putFile(variantId, opts.dst);
        });
    })
    .then(function (result) {
      // XXX:
      result.src = opts.src;
      result.id = variantId;
      return result;
    });
}
//
// extra operations for image files
//

function getPreset(name) {
  return presets[name];
}

function _sanitizeId(id) {
  return id ? String(id).replace(/[^a-zA-Z0-9가-힣-_.]/g, '_') : '';
  //return id ? String(id).replace(/[^\w\.]/g, '_') : '';
  //return encodeURIComponent(id);
}

function _getVariantId(id, variation, ext) {
  var variantId = id + '.d';
  if (variation) {
    variantId += '/' + variation;
  }
  if (ext) {
    variantId += '.' + ext;
  }
  return variantId;
}

/**
* parse common geometry string.
*
* result contains:
*    - {number} w
*    - {number} h
*    - {number} x
*    - {number} y
*    - {string} flags
*
* @param {string} geometry
* @returns {object} parsed geometry
*/
function parseGeometry(geometry) {
  var result = {};
  if (!geometry) {
    return result;
  }
  //..............12.....3.4......5..6......7.......8....9.0
  var matches = /^((\d+)?(x(\d+))?(\+(\d+)\+(\d+))?)(\w*)(@(\d)x)?$/.exec(geometry);
  if (!matches) {
    throw new Error('invalid_param_geometry');
  }
  if (matches[1]) {
    result.w = parseInt(matches[2], 10);
    result.h = parseInt(matches[4], 10);
    if (isNaN(result.w) && isNaN(result.h)) {
      throw new Error('invalid_param_geometry_size');
    }
    if (matches[5]) {
      result.x = parseInt(matches[6], 10);
      result.y = parseInt(matches[7], 10);
    } else {
      result.flags = matches[8];
    }
  } else {
    result = getPreset(matches[8]);
    if (!result) {
      throw new Error('invalid_param_geometry_preset');
    }
  }
  if (matches[10]) {
    var scale = parseInt(matches[10], 10);
    if (scale < 2 || scale > 9) {
      throw new Error('invalid_param_geometry_scale');
    }
    result.w *= scale;
    result.h *= scale;
    result.x *= scale;
    result.y *= scale;
  }
  return result;
}

//
//
//

/**
 * configure pictor main module.
 *
 * `config` contains:
 *
 *    - {string} tempDir
 *    - {object} presets
 *    - {object} data
 *    - {object} cache
 *
 * @param {object} config
 */
function configure(config) {
  DEBUG && debug('configure pictor...');

  tempDir = config.tempDir || require('os').tmpdir();//'/tmp/pictor/temp';
  FS.makeTree(tempDir)
    .fail(function (err) {
      console.warn('** warning ** failed to create tempDir:', tempDir, err);
      tempDir = require('os').tmpdir();
    })
    .then(function () {
      DEBUG && debug('tempDir:', tempDir);
    })
    .done();

  _.extend(presets, config.presets);
  DEBUG && debug('presets: ', presets);

  if (config.converters) {
    converters = Object.keys(config.converters).reduce(function (result, name) {
      var opts = config.converters[name] || {};
      result[name] = converter.createConverter(name, opts);
      return result;
    }, {});
    DEBUG && debug('converters: ', Object.keys(converters));
  } else {
    console.warn('** waning ** no converters configured!');
  }

  if (!config.data) {
    console.error('** fatal ** no data storage configuration!');
    process.exit(1);
  }
  dataStorage = storage.createStorage(config.data.provider, config.data);

  if (!config.cache) {
    console.error('** fatal ** no cache storage configuration!');
    process.exit(1);
  }
  cacheStorage = storage.createStorage(config.cache.provider, config.cache);
}

module.exports = {
  getExtension: getExtension,
  getMimeType: getMimeType,
  getTempPath: getTempPath,
  putFile: putFile,
  deleteFile: deleteFile,
  getFile: getFile,
  convertFile: convertFile,
  getPreset: getPreset,
  parseGeometry: parseGeometry,
//  getVariantImageFile: getVariantImageFile,
//  getResizedImageFile: getResizedImageFile,
//  getCroppedImageFile: getCroppedImageFile,
//  getThumbnailImageFile: getThumbnailImageFile,
//  getConvertedImageFile: getConvertedImageFile,
//  getOptimizedImageFile: getOptimizedImageFile,
//  getImageMetaFile: getImageMetaFile,
//  getImageExifFile: getImageExifFile,
//  getHolderImageFile: getHolderImageFile,
  configure: configure
};
