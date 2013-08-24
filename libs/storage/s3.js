'use strict';

var
  util = require('util'),
  knox = require('knox'),
  Q = require('q'),
  storage = require('./storage'),
  debug = require('debug')('pictor:storage:s3'),
  DEBUG = debug.enabled;

/**
 * Amazon S3 based implementation of {@link Storage}.
 *
 * `config` contains:
 *
 *    - {string} key
 *    - {string} secret
 *    - {string} bucket
 *    - {string} baseDir: base directory(not a physical directory but just a prefix string in S3) to store files
 *    - {string} [baseUrl]: http url to access `baseDir`
 *
 * @param {object} config
 * @constructor
 */
function S3Storage(config) {
  // s3 key has no leading '/'
  if (config.baseDir && config.baseDir.charAt(0) === '/') {
    config.baseDir = config.baseDir.substring(1);
  }
  S3Storage.super_.apply(this, arguments);
  this.s3Client = knox.createClient({key: config.key, secret: config.secret, bucket: config.bucket});
  DEBUG && debug('create s3 storage:', config);
}
util.inherits(S3Storage, storage.Storage);

S3Storage.prototype.putFile = function (id, src) {
  DEBUG && debug('s3.putFile', src, '---->', id);
  var dst = this._getPath(id);
  var url = this._getUrl(id);

  return Q.ninvoke(this.s3Client, 'putFile', src, dst)
    .then(function (result) {
      DEBUG && debug('s3.putFile', id, 'ok', result.statusCode, result.headers);
      if (result.statusCode < 200 || result.statusCode >= 300) {
        throw new storage.StorageError('putFile err', result.statusCode, result);
      }
      return {
        url: url,
        file: src
      };
    });
};

S3Storage.prototype.getFile = function (id) {
  DEBUG && debug('s3.getFile', id);
  var src = this._getPath(id);
  var url = this._getUrl(id);

  return Q.ninvoke(this.s3Client, 'getFile', src)
    .then(function (result) {
      DEBUG && debug('s3.getFile', id, 'ok', result.statusCode, result.headers);
      if (result.statusCode < 200 || result.statusCode >= 300) {
        throw new storage.StorageError('getFile err', result.statusCode, result);
      }
      return {
        url: url,
        stream: result
      };
    });
};

S3Storage.prototype.deleteFile = function (id) {
  DEBUG && debug('s3.deleteFile', id);

  var src = this._getPath(id);

  // assume 'src' is file
  var s3Client = this.s3Client;
  return Q.ninvoke(s3Client, 'deleteFile', src)
    .then(function (result) {
      DEBUG && debug('s3.deleteFile', id, 'ok', result.statusCode, result.headers);
      if (result.statusCode === 404) {
        // err... assume 'src' is directory
        return Q.ninvoke(s3Client, 'list', { prefix: src + '/' })
          .then(function (result) {
            DEBUG && debug('s3.list ok', result);
            if (result.Contents.length === 0) {
              return true;
            }
            var srcs = result.Contents.map(function (file) {
              return file.Key;
            });
            return Q.ninvoke(s3Client, 'deleteMultiple', srcs);
          })
          .then(function (result) {
            DEBUG && debug('s3.deleteMultiple ok', result.statusCode, result.headers);
            return true;
          });
      }
      if (result.statusCode < 200 || result.statusCode >= 300) {
        throw new storage.StorageError('deleteFile err', result.statusCode, result);
      }
      return true;
    });
};

module.exports = S3Storage;
