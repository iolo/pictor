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
  this.config = config || {};
  // ensure trailing slash
  if (this.config.baseDir && this.config.baseDir.substr(-1) !== '/') {
    this.config.baseDir = this.config.baseDir + '/';
  }
  if (this.config.baseUrl && this.config.baseUrl.substr(-1) !== '/') {
    this.config.baseUrl = this.config.baseUrl + '/';
  }
}

Storage.prototype._getPath = function (id) {
  var result = this.config.baseDir;
  if (id) {
    result += id;
  }
  return result;
};

Storage.prototype._getUrl = function (id) {
  var result = this.config.baseUrl;
  // return `null` if this storage doesn't support public url
  if (!result) {
    return null;
  }
  if (id) {
    result += id;
  }
  return result;
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
  return Q.reject(new StorageError(501, 'not implemented'));
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
  return Q.reject(new StorageError(501, 'not_implemented'));
};

/**
 * delete file from the remote storage.
 *
 * @param {string} id
 * @return {Promise} success or not.
 */
Storage.prototype.deleteFile = function (id) {
  DEBUG && debug('storage.deleteFile:', id);
  return Q.reject(new StorageError(501, 'not_implemented'));
};

Storage.prototype.renameFile = function (id, targetId) {
  DEBUG && debug('storage.renameFile:', id, targetId);
  return Q.reject(new StorageError(501, 'not_implemented'));
};

Storage.prototype.listFiles = function (criteria) {
  DEBUG && debug('storage.listFiles:', criteria);
  return Q.reject(new StorageError(501, 'not_implemented'));
};

//
//
//

function wrapError(err) {
  if (err) {
    if (err instanceof StorageError) {
      //throw err;
      return Q.reject(err);
    }
    if (err.code === 'ENOENT') {
      //throw new StorageError('file_not_found', 404, err);
      return Q.reject(new StorageError('not_found', 404, err));
    }
  }
  //throw new StorageError('storage_error', 500, err;
  return Q.reject(new StorageError('storage_error', 500, err));
}


module.exports = {
  StorageError: StorageError,
  Storage: Storage,
  wrapError: wrapError
};
