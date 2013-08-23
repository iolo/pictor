'use strict';

var
  util = require('util'),
  knox = require('knox'),
  Q = require('q'),
  StorageProvider = require('./storage').StorageProvider,
  debug = require('debug')('pictor:storage:s3'),
  DEBUG = debug.enabled;

/**
 * Amazon S3 based implementation of {@link StorageProvider}.
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
function S3StorageProvider(config) {
  S3StorageProvider.super_.apply(this, arguments);
  this.s3Client = knox.createClient({key: config.key, secret: config.secret, bucket: config.bucket});
  DEBUG && debug('create s3 storage provider: ', config);
}
util.inherits(S3StorageProvider, StorageProvider);

S3StorageProvider.prototype.putFile = function (id, src) {
  DEBUG && debug('s3.putFile', src, '---->', id);
  var dst = this._getPath(id);
  var url = this._getUrl(id);

  return Q.ninvoke(this.s3Client, 'putFile', src, dst)
    .then(function (result) {
      console.log('*** putfile ok:', result.statusCode, result.headers);
      if (result.statusCode < 200 || result.statusCode >= 300) {
        throw new Error('file_not_found');
      }
      return {
        url: url,
        file: src
      };
    })
    .fail(function (err) {
      console.log('*** putfile err:', err);
      throw err;
    })
};

S3StorageProvider.prototype.getFile = function (id) {
  DEBUG && debug('s3.getFile', id);
  var src = this._getPath(id);
  var url = this._getUrl(id);

  return Q.ninvoke(this.s3Client, 'getFile', src)
    .then(function (result) {
      console.log('*** getfile ok:', result.statusCode, result.headers);
      if (result.statusCode < 200 || result.statusCode >= 300) {
        throw new Error('file_not_found');
      }
      return {
        url: url,
        stream: result
      };
    })
    .fail(function (err) {
      console.log('*** getfile err:', err);
      throw err;
    });
};

S3StorageProvider.prototype.deleteFile = function (id) {
  DEBUG && debug('s3.deleteFile', id);

  var src = this._getPath(id);

  var s3Client = this.s3Client;
  return Q.ninvoke(s3Client, 'deleteFile', src)
    .then(function (result) {
      console.log('*** deletefile ok:', result.statusCode, result.headers);
      if (result.statusCode < 200 || result.statusCode >= 300) {
        console.log('*** deletefile not found: ignore');
        //throw new Error('file_not_found');
      }
      return Q.ninvoke(s3Client, 'list', { prefix: src.substring(1) + '/' }); // s3 key has no leading '/'
    })
    .then(function (result) {
      console.log('*** list ok:', result);//result.statusCode, result.headers);
      //if (result.statusCode < 200 || result.statusCode >= 300) {
      //  throw new Error('file_not_found');
      //}
      if (result.Contents.length === 0) {
        return true;
      }
      var srcs = result.Contents.map(function (file) {
        return file.Key;
      });
      console.log('*** srcs:', srcs);
      return Q.ninvoke(s3Client, 'deleteMultiple', srcs);
    })
    .then(function (result) {
      console.log('*** deletemultiple ok:', result.statusCode, result.headers);
      if (result.statusCode < 200 || result.statusCode >= 300) {
        //throw new Error('file_not_found');
      }
      return true;
    })
    .fail(function (err) {
      console.log('*** deletefile err:', err);
      throw err;
    });
};

module.exports = {
  S3StorageProvider: S3StorageProvider
};
