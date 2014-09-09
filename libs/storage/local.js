'use strict';

/** @module pictor.storage.local */

var
    util = require('util'),
    path = require('path'),
    Q = require('q'),
    FS = require('q-io/fs'),
    Storage = require('./storage'),
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
util.inherits(LocalStorage, Storage);

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
        .fail(Storage.reject);
};

LocalStorage.prototype.getFile = function (id) {
    DEBUG && debug('local.getFile', id);
    // NOTE: no copy!
    var src = this._getPath(id);
    var url = this._getUrl(id);
    return FS.stat(src)
        .then(function (result) {
            DEBUG && debug('local.getFile:', src, result);
            if (!result.isFile()) {
                throw new Storage.Error('not regular file: ' + src, 500, result);
            }
            return {url: url, file: src};
        })
        .fail(Storage.reject);
};

LocalStorage.prototype.deleteFile = function (id) {
    DEBUG && debug('local.deleteFile', id);
    var src = this._getPath(id);
    return FS.removeTree(src)
        .then(function () {
            return true;
        })
        .fail(Storage.reject);
};

LocalStorage.prototype.renameFile = function (id, targetId) {
    var source = this._getPath(id);
    var target = this._getPath(targetId);
    return FS.rename(source, target)
        .then(function (result) {
            DEBUG && debug('local.renameFile:', source, '-->', target, '-->', result);
            return true;
        })
        .fail(Storage.reject);
};

LocalStorage.prototype.listFiles = function (criteria) {
    var self = this;
    return FS.list(this.config.baseDir)
        .then(function (filenames) {
            DEBUG && debug('local.listFile:', criteria, '-->', filenames);
            var idPattern = '';
            if (criteria.prefix) {
                idPattern = '^' + criteria.prefix;
            }
            if (criteria.format) {
                idPattern += '.*\\.' + criteria.format + '$';
            }
            var idRegExp = new RegExp(idPattern, 'i');
            var fromIndex = criteria.skip || 0;
            var toIndex = (criteria.limit > 0) ? fromIndex + criteria.limit : filenames.length + 1;
            return filenames.reduce(function (result, id, index) {
                if (fromIndex <= index && index <= toIndex && idRegExp.test(id)) {
                    var src = self._getPath(id);
                    var url = self._getUrl(id);
                    // TODO: FS.stat(src).then(function(stats) { ... }); size, type....
                    result.push({id: id, url: url, file: src});
                }
                return result;
            }, []);
        })
        .fail(Storage.reject);
};

module.exports = LocalStorage;
