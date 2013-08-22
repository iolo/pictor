'use strict';

var
  util = require('util'),
  path = require('path'),
  Q = require('q'),
  FS = require('q-io/fs'),
  StorageProvider = require('./storage').StorageProvider,
  debug = require('debug')('pictor:storage:local'),
  DEBUG = debug.enabled;

/**
 * local file system based implementation of {@link StorageProvider}
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
 */
function LocalStorageProvider(config) {
  LocalStorageProvider.super_.apply(this, arguments);
  DEBUG && debug('create local storage provider: ', config);
  FS.makeTree(this.config.baseDir).done();
}
util.inherits(LocalStorageProvider, StorageProvider);

LocalStorageProvider.prototype.putFile = function (id, src) {
  DEBUG && debug('local.putFile', src, '--->', id);
  var dst = this._getPath(id);
  var url = this._getUrl(id);
  return FS.makeTree(path.dirname(dst))
    .then(function () {
      return FS.copy(src, dst);
    })
    .then(function () {
      return {url: url, file: dst};
    });
};

LocalStorageProvider.prototype.getFile = function (id) {
  DEBUG && debug('local.getFile', id);
  // NOTE: no copy!
  var src = this._getPath(id);
  var url = this._getUrl(id);
  return FS.isFile(src)
    .then(function (result) {
      if (!result) {
        // not exist or directory...
        throw new Error('file not found');
      }
      return {url: url, file: src};
    });
};

LocalStorageProvider.prototype.deleteFile = function (id) {
  DEBUG && debug('local.deleteFile', id);
  var src = this._getPath(id);
  return FS.removeTree(src)
    .then(function () {
      return true;
    });
};

module.exports = {
  LocalStorageProvider: LocalStorageProvider
};
