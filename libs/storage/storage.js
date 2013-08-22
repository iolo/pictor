'use strict';

var
  util = require('util'),
  debug = require('debug')('pictor:storage'),
  DEBUG = debug.enabled;

/**
 * abstract parent class of storage provider.
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
function StorageProvider(config) {
  this.config = config;
}

StorageProvider.prototype._getPath = function (id) {
  return this.config.baseDir + '/' + id;
};

StorageProvider.prototype._getUrl = function (id) {
  if (!this.config.baseUrl) {
    // this provider doesn't support public url
    return null;
  }
  return this.config.baseUrl + '/' + id;
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
StorageProvider.prototype.putFile = function (id, src) {
  DEBUG && debug('storage.putFile:', src, '--->', id);
  throw new Error('abstract method');
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
StorageProvider.prototype.getFile = function (id) {
  DEBUG && debug('storage.getFile:', id);
  throw new Error('abstract method');
};

/**
 * delete file from the remote storage.
 *
 * @param {string} id
 * @return {Promise} success or not.
 */
StorageProvider.prototype.deleteFile = function (id) {
  DEBUG && debug('storage.deleteFile:', id);
  throw new Error('abstract method');
};

module.exports = {
  StorageProvider: StorageProvider,
  inherited: function (ProviderCtor) {
    util.inherits(ProviderCtor, StorageProvider);
  }
};
