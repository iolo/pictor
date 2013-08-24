'use strict';

var
  util = require('util'),
  Q = require('q'),
  debug = require('debug')('pictor:storage'),
  DEBUG = debug.enabled;

//
//
//

/**
 * abstract superclass for storage specific error.
 *
 * @param {string} [message='unknown']
 * @param {number} [status=0]
 * @param {*} [cause]
 * @constructor
 * @abstract
 */
function StorageError(message, status, cause) {
  this.message = message || 'unknown';
  this.status = status || 0;
  this.cause = cause;
  StorageError.super_.call(this, message);
}
util.inherits(StorageError, Error);
StorageError.prototype.name = 'StorageError';
StorageError.prototype.toString = function () {
  return 'StorageError: ' + this.message;
};

//
//
//

/**
 * abstract parent class of storage.
 *
 * `config` contains:
 *
 *    - {string} baseDir: base directory to store files
 *    - {string} [baseUrl]: http url to access `baseDir`.
 *
 * NOTE: `config.baseUrl` should be `null` when this storage doesn't support http access.
 *
 * @param {object} config
 * @constructor
 * @abstract
 */
function Storage(config) {
  // ensure trailing slash
  if (config.baseDir && config.baseDir.substr(-1) !== '/') {
    config.baseDir = config.baseDir + '/';
  }
  if (config.baseUrl && config.baseUrl.substr(-1) !== '/') {
    config.baseUrl = config.baseUrl + '/';// ensure trailing slash
  }
  this.config = config;
}

Storage.prototype._getPath = function (id) {
  return this.config.baseDir + id;
};

Storage.prototype._getUrl = function (id) {
  if (!this.config.baseUrl) {
    // this storage doesn't support public url
    return null;
  }
  return this.config.baseUrl + id;
};

/**
 * put local file into remote storage.
 *
 * resolved result contains:
 *    - {string} [file]
 *    - {string} [stream]
 *    - {string} [url]
 *    - {string} [type]
 *    - {number} [size]
 *
 * the result should have valid `stream` or `file` or `url` at least.
 *
 * @param {string} id
 * @param {string} src
 * @return {Promise}
 */
Storage.prototype.putFile = function (id, src) {
  DEBUG && debug('storage.putFile:', src, '--->', id);
  return Q.reject(new Error('abstract method'));
};

/**
 * get file from remote storage.
 *
 * resolved result contains:
 *    - {string} [file]
 *    - {string} [stream]
 *    - {string} [url]
 *    - {string} [type]
 *    - {number} [size]
 *
 * @param {string} id
 * @return {Promise} url, file or stream
 */
Storage.prototype.getFile = function (id) {
  DEBUG && debug('storage.getFile:', id);
  return Q.reject(new Error('abstract method'));
};

/**
 * delete file from the remote storage.
 *
 * @param {string} id
 * @return {Promise} success or not.
 */
Storage.prototype.deleteFile = function (id) {
  DEBUG && debug('storage.deleteFile:', id);
  return Q.reject(new Error('abstract method'));
};

module.exports = {
  StorageError: StorageError,
  Storage: Storage
};
