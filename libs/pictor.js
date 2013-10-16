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
    xxs: {converter: 'thumbnail', w: 16},
    xs: {converter: 'thumbnail', w: 24},
    s: {converter: 'thumbnail', w: 32},
    m: {converter: 'thumbnail', w: 48},
    l: {converter: 'thumbnail', w: 64},
    xl: {converter: 'thumbnail', w: 128},
    xxl: {converter: 'thumbnail', w: 256},
    'xxs@2x': {converter: 'thumbnail', w: 32},
    'xs@2x': {converter: 'thumbnail', w: 48},
    's@2x': {converter: 'thumbnail', w: 64},
    'm@2x': {converter: 'thumbnail', w: 96},
    'l@2x': {converter: 'thumbnail', w: 128},
    'xl@2x': {converter: 'thumbnail', w: 256},
    'xxl@2x': {converter: 'thumbnail', w: 512}
  },
  converters = {},
  dataStorage,
  cacheStorage;

function _getTempPath(prefix, suffix) {
  return path.join(tempDir, [
    prefix || '',
    Date.now().toString(36),
    '-',
    (Math.random() * 0x100000000 + 1).toString(36),
    '-',
    process.pid,
    suffix || ''
  ].join(''));
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

/**
 * delete all variants from cache storage.
 *
 * @param {string} id
 * @returns {promise} success or not
 * @private
 */
function _deleteVariantFiles(id) {
  // XXX: storage providers handle this? or not???
  // ex. cacheStorage.deleteVariantsFiles(id);
  // delete files with prefix(or delete directory)
  return cacheStorage.deleteFile(_getVariantId(id));
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
 * NOTE: this always overwrites existing file.
 *
 * @param {string} id file identifier
 * @param {string|stream} file local file path or readable stream
 * @returns {promise.<PictorFile>}
 */
function putFile(id, file) {
  DEBUG && debug('put file:', id, '--->', file);

  return _deleteVariantFiles(id)
    .fail(function () {
      //if(err instanceof NotFoundError) { return true; } else throw err;
      return true;
    })
    .then(function () {
      // XXX: handle stream
      if (file instanceof stream.Stream) {
        var d = Q.defer();
        var tempFilePath = _getTempPath(null, id);
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
 * get a file.
 *
 * @param {string} id
 * @returns {promise.<PictorFile>}
 */
function getFile(id) {
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
  return _deleteVariantFiles(id)
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
 * @param {*} opts various converter specific params
 * @returns {promise.<PictorFile>}
 */
function convertFile(opts) {
  // XXX: need cleanup! this is the most puzzling code in pictor :S

  // 'preset' converter is special one!
  if (opts.converter === 'preset') {
    if (!opts.preset) {
      throw 'required_param_preset';
    }
    var preset = presets[opts.preset];
    if (!preset) {
      throw 'invalid_param_preset';
    }
    // overrides preset with specified params
    opts = _.extend(opts, preset);
    DEBUG && debug('*** convert - preset', opts.preset, preset, '--->', opts);
  }

  var converter = converters[opts.converter];
  if (!converter) {
    throw 'invalid_param_converter';
  }

  opts.src = opts.id; // getExtension refer opts.src to determine default ext.
  opts.format = converter.getExtension(opts);
  opts.variant = converter.getVariation(opts) + '.' + opts.format;

  var variantId = _getVariantId(opts.id || opts.converter, opts.variant);

  DEBUG && debug('*** convert - prepare', opts, '--->', variantId);

  // get variant from cache storage
  return cacheStorage.getFile(variantId)
    .fail(function () {
      // variant not in cache storage
      DEBUG && debug('*** convert - variant not in cache', variantId);

      // TODO: better way to handle various input/ouput of converter?
      // 0..n input -> 1..m output

      // prepare temp file for output
      DEBUG && debug('*** convert - prepare dst', opts.dst);
      opts.dst = _getTempPath(null, opts.variant);

      // prepare for input
      return Q.resolve(opts)
        .then(function (opts) {
          // 2.3 no input required(holder converter)
          DEBUG && debug('*** convert - no src');
          if (!opts.id) {
            opts.src = null;
            return opts;
          }
          // input required(most converters) -> get source from data storage
          DEBUG && debug('*** convert - get src', opts.id);
          return dataStorage.getFile(opts.id)
            .then(function (src) {
              opts.src = src.file || src.stream;
              // prepare temp file for output
              DEBUG && debug('*** convert - prepare dst', opts.dst);
              return opts;
            });
        })
        .then(function (opts) {
          // convert source to temp file
          DEBUG && debug('*** convert - converting...', opts);
          return converter.convert(opts);
        })
        .then(function () {
          // put temp file into cache storage
          DEBUG && debug('*** convert - save dst into cache', variantId);
          return cacheStorage.putFile(variantId, opts.dst);
          // TODO: delete tempFilePath
        });
    })
    .then(function (result) {
      // variant in cache storage
      DEBUG && debug('*** convert - variant in cache', result);
      result.id = opts.id;
      result.variant = opts.variant;
      // delete result.file
      // delete result.stream
      return result;
    });
}

/**
 * get a variant file.
 *
 * @param {string} id
 * @param {string} variant
 * @returns {promise.<PictorFile>}
 */
function getVariantFile(id, variant) {
  return cacheStorage.getFile(_getVariantId(id, variant))
    .then(function (result) {
      result.id = id;
      result.variant = variant;
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
  getVariantFile: getVariantFile,
  configure: configure
};
