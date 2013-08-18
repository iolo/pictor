'use strict';

var
  fs = require('fs'),
  path = require('path'),
  _ = require('lodash'),
  Q = require('q'),
  fileutils = require('./fileutils'),
  imgutils = require('./imgutils'),
  debug = require('debug')('pictor'),
  DEBUG = debug.enabled;

var
  dataStorage,
  cacheStorage,
  presets = {
    xxs: {op: 'thumbnail', w: 16},
    xs: {op: 'thumbnail', w: 24},
    s: {op: 'thumbnail', w: 32},
    m: {op: 'thumbnail', w: 48},
    l: {op: 'thumbnail', w: 64},
    xl: {op: 'thumbnail', w: 128},
    xxl: {op: 'thumbnail', w: 256}
  };

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
//var IMAGE_EXTENSIONS = {
//  'image/png': 'png',
//  'image/jpeg': 'jpg',
//  'image/pjpeg': 'jpg',
//  'image/gif': 'gif'
//};
//
//var IMAGE_MIME_TYPES = {
//  'png': 'image/png',
//  'jpg': 'image/jpeg',
//  'jpeg': 'image/jpeg',
//  'gif': 'image/gif'
//};
//
//var RESIZE_FLAGS = {
//  'force': '!',
//  'percent': '%',
//  'fillarea': '^',
//  'enlarge': '<',
//  'shrink': '>',
//  'pixel': '@'
//};

/**
 * put a file into storage.
 *
 * @param {string} id
 * @param {string} format
 * @param {string} filePath
 * @returns {promise}
 */
function putFile(id, format, filePath) {
  var dataPath = dataStorage.getPath(id, format);
  return dataStorage.putFile(filePath, dataPath);
  // TODO: delete all variants from cache.
  //var cachePath = cacheStorage.getPath(id);
  //cacheStorage.deleteFiles(cachePath + '*');
}

/**
 * delete a file and its variants from storage.
 *
 * @param {string} id
 * @param {string} format
 * @returns {promise} success or not
 */
function deleteFile(id, format) {
  var dataPath = dataStorage.getPath(id, format);
  return dataStorage.deleteFile(dataPath);
  // TODO: delete all variants from cache.
  //var cachePath = cacheStorage.getPath(id);
  //cacheStorage.deleteFiles(cachePath + '*');
}

/**
 * get a file from storage.
 *
 * @param {string} id
 * @param {string} format
 * @returns {promise} object contains local file path or remote url
 */
function getFile(id, format) {
  var dataPath = dataStorage.getPath(id, format);
  return dataStorage.exists(dataPath)
    .then(function () {
      // exists... download it!
      return {file: dataPath};
    });
}

function parseVariantGeometry(geometry) {
  if (!geometry) {
    return imgutils.convertOpts();
  }
  //..............12.....3.4......5..6......7.......8....9.0
  var matches = /^((\d+)?(x(\d+))?(\+(\d+)\+(\d+))?)(\w*)(@(\d)x)?$/.exec(geometry);
  if (!matches) {
    throw new Error('invalid_param_geometry');
  }
  //console.log('variant geometry:', geometry, '--->matches:', matches);
  var convertOpts;
  if (matches[1]) {
    var w = parseInt(matches[2], 10);
    var h = parseInt(matches[4], 10);
    if (isNaN(w) && isNaN(h)) {
      throw new Error('invalid_param_geometry_size');
    }
    var flags = matches[8];
    if (matches[5]) {
      var x = parseInt(matches[6], 10);
      var y = parseInt(matches[7], 10);
      convertOpts = imgutils.cropOpts(w, h, x, y, flags);
    } else {
      convertOpts = imgutils.resizeOpts(w, h, flags);
    }
  } else {
    convertOpts = presets[matches[8]];
    if (!convertOpts) {
      throw new Error('invalid_param_geometry_preset');
    }
  }
  if (matches[10]) {
    var scale = parseInt(matches[10], 10);
    if (scale < 2 || scale > 9) {
      throw new Error('invalid_param_geometry_scale');
    }
    convertOpts.w *= scale;
    convertOpts.h *= scale;
    convertOpts.x *= scale;
    convertOpts.y *= scale;
  }
  return convertOpts;
}

function getVariantId(id, geometry) {
  return (geometry) ? id + '-_-' + geometry : id;
}

/**
 *
 * @param {string} id
 * @param {string} geometry
 * @param {string} format
 * @returns {promise}
 */
function getVariantImageFile(id, geometry, format) {
  var cachePath = cacheStorage.getPath(getVariantId(id, geometry), format);
  return cacheStorage.exists(cachePath)
    .fail(function () {
      // cache doesn't have the variant... create it now! and...
      var dataPath = dataStorage.getPath(id);
      var convertOpts = parseVariantGeometry(geometry);
      console.log('variant opts:', convertOpts);
      return imgutils.convertImage(dataPath, cachePath, convertOpts);
    })
    .then(function () {
      // exists... download it!
      return {file: cachePath};
    });
}

function parseHolderGeometry(geometry) {
  //..............12.....3.4.......5....6.7
  var matches = /^((\d+)?(x(\d+))?)(\w*)(@(\d)x)?$/.exec(geometry);
  if (!matches) {
    throw new Error('invalid_param_geometry');
  }
  //console.log('holder geometry:', geometry, '--->matches:', matches);
  var createOpts;
  if (matches[1]) {
    var w = parseInt(matches[2], 10);
    var h = parseInt(matches[4], 10);
    if (isNaN(w) && isNaN(h)) {
      throw new Error('invalid_param_geometry_size');
    }
    createOpts = {w: w, h: h};
  } else {
    createOpts = presets[matches[5]];
    if (!createOpts) {
      throw new Error('invalid_param_geometry_preset');
    }
  }
  if (matches[7]) {
    var scale = parseInt(matches[7], 10);
    if (scale < 2 || scale > 9) {
      throw new Error('invalid_param_geometry_scale');
    }
    createOpts.w *= scale;
    createOpts.h *= scale;
  }
  return createOpts;
}

/**
 *
 * @param {string} geometry
 * @param {string} format
 * @returns {promise}
 */
function getHolderImageFile(geometry, format) {
  var cachePath = cacheStorage.getPath(getVariantId('holder', geometry), format);
  return cacheStorage.exists(cachePath)
    .fail(function () {
      var createOpts = parseHolderGeometry(geometry);
      return imgutils.createImage(cachePath, createOpts);
    })
    .then(function () {
      return {file: cachePath};
    });
}

//
//
//

function getLocalDataPath() {
  return dataStorage.config.basePath;
}

function getLocalCachePath() {
  return cacheStorage.config.basePath;
}

/**
 * configure pictor main module.
 *
 * `config` contains:
 *
 *    - {object} presets
 *    - {object} local
 *    - {object} remote
 *
 * @param {object} config
 * @return {object} this
 */
function configure(config) {
  DEBUG && debug('configure pictor...');

  _.extend(presets, config.presets);

  dataStorage = require('./storage').createProvider('local', config.data);
  cacheStorage = require('./storage').createProvider('local', config.cache);

  // TOOD: multiple remote storages
  //remoteStorage = require('./storage').createProvider('ftp', config.remote);

  return this;
}

module.exports = {
  putFile: putFile,
  deleteFile: deleteFile,
  getFile: getFile,
  getVariantImageFile: getVariantImageFile,
  getHolderImageFile: getHolderImageFile,
  getLocalDataPath: getLocalDataPath,
  getLocalCachePath: getLocalCachePath,
  configure: configure
};
