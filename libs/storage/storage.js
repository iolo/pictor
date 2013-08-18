'use strict';

var
  debug = require('debug')('pictor:storage'),
  DEBUG = debug.enabled;

/**
 * abstract parent class of storage provider.
 *
 * `config` contains:
 *
 *    - {string} [baseUrl]: base url for files
 *    - {string} [basePath]: base directory path for files
 *
 * `baseUrl` should be `null` when the storage doesn't support http access.
 *
 * TODO: support streaming...
 *
 * @param {object} config
 * @constructor
 * @abstract
 */
function StorageProvider(config) {
  this.config = config;
}

/**
 * sanitize the given string for using in file system path.
 *
 * @param {string} str
 * @returns {string}
 * @private
 */
StorageProvider.prototype._sanitize = function (str) {
  // TODO: more robust impl.
  return str ? String(str).replace(/[^\w\.]/g, '-') : '';
};

/**
 * get the http url for the file in storage.
 *
 * @param {string} id
 * @param {string} [format] file extension without leading dot.
 * @returns {string} url or `null` if the storage doesn't support http access.
 */
StorageProvider.prototype.getUrl = function (id, format) {
  // TODO: more robust impl.
  if (!this.config.baseUrl) {
    return null;
  }
  var url = this.config.baseUrl + '/' + this._sanitize(id);
  if (format) {
    url += '.' + this._sanitize(format);
  }
  return url;
};

/**
 * get the http url for the variant file in storage.
 *
 * @param {string} id
 * @param {string} [format] file extension without leading dot.
 * @param {string} [variant] variant suffix
 * @returns {string} url or `null` if the storage doesn't support http access.
 */
/*
StorageProvider.prototype.getCacheUrl = function (id, format, variant) {
  // TODO: more robust impl.
  if (!this.config.cacheUrl) {
    return null;
  }
  var url = this.config.cacheUrl + '/' + this._sanitize(id) + '-_-' + this._sanitize(variant);
  if (format) {
    url += '.' + this._sanitize(format);
  }
  return url;
};
*/

/**
 * get the path for the file in storage.
 *
 * @param {string} id
 * @param {string} [format] file extension without leading dot.
 * @returns {string}
 */
StorageProvider.prototype.getPath = function (id, format) {
  // TODO: more robust impl.
  var filePath = this.config.basePath + '/' + this._sanitize(id);
  if (format) {
    filePath += '.' + this._sanitize(format);
  }
  return filePath;
};

/**
 * get the path for the variant file in storage.
 *
 * @param {string} id
 * @param {string} [format] file extension without leading dot.
 * @param {string} [variant] variant suffix
 * @returns {string}
 */
/*
StorageProvider.prototype.getCachePath = function (id, format, variant) {
  // TODO: more robust impl.
  var filePath = this.config.cachePath + '/' + this._sanitize(id) + '-_-' + this._sanitize(variant);
  if (format) {
    filePath += '.' + this._sanitize(format);
  }
  return filePath;
};
*/

/**
 * check the file at `storagePath` is exist or not.
 *
 * @param {string} storagePath
 * @return {Promise} boolean. exist or not
 */
StorageProvider.prototype.exists = function (storagePath) {
  DEBUG && debug('storage.exists:', storagePath);
  throw new Error('abstract method');
};

/**
 * upload the file at `filePath` into `storagePath`.
 *
 * @param {string} filePath
 * @param {string} storagePath
 * @return {Promise} success or not.
 */
StorageProvider.prototype.putFile = function (filePath, storagePath) {
  DEBUG && debug('storage.putFile:', filePath, '--->', storagePath);
  throw new Error('abstract method');
};

/**
 * download the file at `storagePath` into `filePath`.
 *
 * @param {string} filePath
 * @param {string} storagePath
 * @return {Promise} success or not.
 */
StorageProvider.prototype.getFile = function (filePath, storagePath) {
  DEBUG && debug('storage.gutFile:', filePath, '<---', storagePath);
  throw new Error('abstract method');
};

/**
 * delete the file at `storagePath`.
 *
 * @param {string} storagePath
 * @return {Promise} success or not.
 */
StorageProvider.prototype.deleteFile = function (storagePath) {
  DEBUG && debug('storage.deleteFile:', storagePath);
  throw new Error('abstract method');
};

module.exports = {
  StorageProvider: StorageProvider
};
