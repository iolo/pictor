'use strict';

var
  path = require('path'),
  fs = require('fs'),
  stream = require('stream'),
  _ = require('lodash'),
  Q = require('q'),
  FS = require('q-io/fs'),
  mime = require('mime'),
  ID_NEW = 'new',
  ID_REGEX = /\w+(\.\w+)?/,// /[^a-zA-Z0-9가-힣-_.]/
  DEF_PREFIX = '',
  storage = require('./storage'),
  converter = require('./converter'),
  debug = require('debug')('pictor:main'),
  DEBUG = debug.enabled;

var
  tempDir = '/tmp/pictor/temp',
  presets = {
    xxs: {converter: 'resize', w: 16},
    xs: {converter: 'resize', w: 24},
    s: {converter: 'resize', w: 32},
    m: {converter: 'resize', w: 48},
    l: {converter: 'resize', w: 64},
    xl: {converter: 'resize', w: 128},
    xxl: {converter: 'resize', w: 256}
  },
  converters = {},
  dataStorage,
  cacheStorage;

function _getTempPath(ext) {
  return path.join(tempDir, _.uniqueId('pictor_') + '.' + (ext || 'bin'));
}

/**
 * generate variant id based on source id.
 *
 * @param {string} id source id
 * @param {string} [variation]
 * @param {string} [ext]
 * @returns {string}
 * @private
 */
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


//
//
//

/**
 * @class PictorFile
 * @property {string} id identifier
 * @property {string} source source identifier(only if this file is variant)
 * @property {string} url redirect url
 * @property {stream} stream stream object
 * @property {string} file local file path
 * @property {string} type mime type
 * @property {string} disposition 'inline', 'attachment'
 */
function PictorFile() {
} // DUMMY!

//
// CRUD operations for common files
//

/**
 * put a file.
 *
 * delete the old file and all its variants.
 *
 * @param {string|stream} file
 * @param {string} [id='new'] generate unique id.
 * @param {string} [prefix=''] prefix for generated id
 * @param {string} [type] mime type for generated id
 * @returns {promise.<PictorFile>}
 */
function putFile(file, id, prefix, type) {
  if (!id || id === ID_NEW) {
    id = _.uniqueId(prefix || DEF_PREFIX);
    if (type) {
      id += '.' + mime.extension(type);
    }
  } else if (!ID_REGEX.test(id)) {
    throw 'invalid_param_id';
  }
  DEBUG && debug('put file:', id, '--->', file);

  // XXX: delete files with prefix(or delete directory)
  return cacheStorage.deleteFile(_getVariantId(id))
    .fail(function () {
      //if(err instanceof NotFoundError) { return true; } else throw err;
      return true;
    })
    .then(function () {
      // XXX: handle stream
      if (file instanceof stream.Stream) {
        var d = Q.defer();
        var tempFilePath = _getTempPath();
        fs.createWriteStream(tempFilePath).pipe(file)
          .on('error', function (err) {
            return d.reject(err);
          })
          .on('end', function () {
            return dataStorage.putFile(id, tempFilePath);
            // TODO: delete tempFilePath
          });
        return d.promise;
      }
      return dataStorage.putFile(id, file);
    })
    .then(function (result) {
      // XXX:
      result.id = id;
      // delete result.file
      // delete result.stream
      return result;
    });
}

/**
 * get a file or its variant.
 *
 * @param {string} id
 * @param {string} [variant]
 * @returns {promise.<PictorFile>}
 */
function getFile(id, variant) {
  if (variant) {
    return cacheStorage.getFile(_getVariantId(id, variant))
      .then(function (result) {
        // XXX:
        result.id = variant;
        result.source = id;
        return result;
      });
  }
  return dataStorage.getFile(id)
    .then(function (result) {
      // XXX:
      result.id = id;
      // delete result.file
      // delete result.stream
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
  // XXX: delete files with prefix(or delete directory)
  return cacheStorage.deleteFile(_getVariantId(id))
    .fail(function () {
      //if(err instanceof NotFoundError) { return true; } else throw err;
      return true;
    })
    .then(function () {
      return dataStorage.deleteFile(id);
    });
}

/**
 * convert a file.
 *
 * @param {*} opts
 * @returns {promise.<PictorFile>}
 */
function convertFile(opts) {
  if (opts.preset) {
    opts = _.extend(opts, presets[opts.preset]); // manual params override preset
    if (opts) {
      throw 'invalid_param_preset';
    }
    DEBUG && debug('convert using preset', opts);
  }

  var converter = converters[opts.converter || 'convert'];
  if (!converter) {
    throw 'invalid_param_converter';
  }

  var ext = converter.getExtension(opts);
  var variation = converter.getVariation(opts);
  var variantId = _getVariantId(opts.src || opts.converter, variation, ext);

  DEBUG && debug('convert ', opts.src + '--->', variantId);

  return cacheStorage.getFile(variantId)
    .fail(function () {
      // dst not in cache:
      // 1. get src from data
      return dataStorage.getFile(opts.src)
        .then(function (src) {
          // 2. convert src to temp
          opts.src = src.file || src.stream;
          opts.dst = _getTempPath(ext);
          return converter.convert(opts);
        })
        .then(function () {
          // 2. put temp into dst
          return cacheStorage.putFile(variantId, opts.dst);
        });
    })
    .then(function (result) {
      result.id = variation + '.' + ext;
      result.source = opts.src;
      // delete result.file
      // delete result.stream
      return result;
    });
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
  putFile: putFile,
  deleteFile: deleteFile,
  getFile: getFile,
  convertFile: convertFile,
  configure: configure
};
