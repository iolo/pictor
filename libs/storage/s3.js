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
  S3Storage.super_.apply(this, arguments);
  // s3 key has no leading '/'
  if (this.config.baseDir && this.config.baseDir.charAt(0) === '/') {
    this.config.baseDir = this.config.baseDir.substring(1);
  }
  DEBUG && debug('create s3 storage:', this.config);
  this.s3Client = knox.createClient({key: this.config.key, secret: this.config.secret, bucket: this.config.bucket});
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
    })
    .fail(storage.wrapError);
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
    })
    .fail(storage.wrapError);
};

S3Storage.prototype.deleteFile = function (id) {
  DEBUG && debug('s3.deleteFile', id);

  var src = this._getPath(id);

  // assume 'src' is file
  var s3Client = this.s3Client;
  return Q.ninvoke(s3Client, 'deleteFile', src)
    .then(function (result) {
      DEBUG && debug('s3.deleteFile', id, 'ok', result.statusCode, result.headers);
      // XXX: s3 doesn't report error when delete not-existing file. :S
      if (result.statusCode < 200 || result.statusCode >= 300) {
        throw new storage.StorageError('deleteFile err', result.statusCode, result);
      }
      // err... assume 'src' is directory
      return Q.ninvoke(s3Client, 'list', { prefix: src + '/' })
        .then(function (result) {
          DEBUG && debug('s3.list ok', result);
          if (result.Contents.length === 0) {
            return true;
          }
          return Q.ninvoke(s3Client, 'deleteMultiple', result.Contents.map(function (file) {
            return file.Key;
          }));
        })
        .then(function (result) {
          DEBUG && debug('s3.deleteMultiple ok', result.statusCode, result.headers);
          return true;
        });
    })
    .fail(storage.wrapError);
};

S3Storage.prototype.renameFile = function (id, targetId) {
  // XXX: s3 doesn't support rename, so I do copy and delete here. is this best?
  // see http://docs.aws.amazon.com/AmazonS3/latest/API/RESTObjectCOPY.html
  var source = this._getPath(id);
  var target = this._getPath(targetId);

  var s3Client = this.s3Client;
  return Q.ninvoke(s3Client, 'copyFile', source, target)
    .then(function (result) {
      DEBUG && debug('s3.renameFile copyFile:', source, '-->', target, '-->', result);
      return Q.ninvoke(s3Client, 'deleteFile', source)
        .then(function (result) {
          DEBUG && debug('s3.renameFile deleteFile:', source, '-->', result);
          return true;
        });
    })
    .fail(storage.wrapError);
};

S3Storage.prototype.listFiles = function (criteria) {
  var self = this;
  // TODO: support skip/limit paging. is it possible???
  // http://docs.aws.amazon.com/AmazonS3/latest/API/RESTBucketGET.html
  var listOpts = {prefix: criteria.prefix || ''};

    var s3Client = this.s3Client;
  return Q.ninvoke(s3Client, 'list', listOpts)
    .then(function (result) {
      DEBUG && debug('s3.listFile:', criteria, '-->', result);
      return result.Contents.reduce(function (result, file) {
        var src = self._getPath(file.Key);
        var url = self._getUrl(file.Key);
        result.push({id: file.Key, url: url, file: src, name: file.Key, size: file.Size, date: file.LastModified});
        return result;
      }, []);
    })
    .fail(storage.wrapError);
};

module.exports = S3Storage;
