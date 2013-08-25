'use strict';

var
  util = require('util'),
  path = require('path'),
  Q = require('q'),
  FS = require('q-io/fs'),
  storage = require('./storage'),
  debug = require('debug')('pictor:storage:local'),
  DEBUG = debug.enabled;

/**
 * local file system based implementation of {@link Storage}
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
function LocalStorage(config) {
  LocalStorage.super_.apply(this, arguments);
  DEBUG && debug('create local storage:', this.config);
  FS.makeTree(this.config.baseDir).done();
}
util.inherits(LocalStorage, storage.Storage);

LocalStorage.prototype.putFile = function (id, src) {
  DEBUG && debug('local.putFile', src, '--->', id);
  var dst = this._getPath(id);
  var url = this._getUrl(id);
  return FS.makeTree(path.dirname(dst))
    .then(function () {
      return FS.copy(src, dst);
    })
    .then(function () {
      return {url: url, file: dst};
    })
    .fail(storage.wrapError);
};

LocalStorage.prototype.getFile = function (id) {
  DEBUG && debug('local.getFile', id);
  // NOTE: no copy!
  var src = this._getPath(id);
  var url = this._getUrl(id);
  return FS.stat(src)
    .then(function (result) {
      console.log('local.getFile:', src, result);
      if (!result.isFile()) {
        return storage.wrapError('not regular file: ' + src, 500, result);
        //throw new storage.StorageError('not regular file: ' + src, 500, result);
      }
      return {url: url, file: src};
    })
    .fail(storage.wrapError);
};

LocalStorage.prototype.deleteFile = function (id) {
  DEBUG && debug('local.deleteFile', id);
  var src = this._getPath(id);
  return FS.removeTree(src)
    .then(function () {
      return true;
    })
    .fail(storage.wrapError);
};

module.exports = LocalStorage;
