'use strict';

/** @module pictor.storage.storage */

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
 * @param {number} [code=0]
 * @param {*} [cause]
 * @constructor
 * @abstract
 */
function StorageError(message, code, cause) {
    this.message = message || 'unknown';
    this.code = code || 0;
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
    return Q.reject(new StorageError('not_implemented', 501));
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
    return Q.reject(new StorageError('not_implemented', 501));
};

/**
 * delete file from the remote storage.
 *
 * @param {string} id
 * @return {Promise} success or not.
 */
Storage.prototype.deleteFile = function (id) {
    DEBUG && debug('storage.deleteFile:', id);
    return Q.reject(new StorageError('not_implemented', 501));
};

Storage.prototype.renameFile = function (id, targetId) {
    DEBUG && debug('storage.renameFile:', id, targetId);
    return Q.reject(new StorageError('not_implemented', 501));
};

Storage.prototype.listFiles = function (criteria) {
    DEBUG && debug('storage.listFiles:', criteria);
    return Q.reject(new StorageError('not_implemented', 501));
};

//
//
//

/**
 * convenient func to reject promise with the given cause.
 *
 * @param {Error|*} [reason]
 * @returns {promise} always rejected promise
 */
function reject(reason) {
    if (reason instanceof StorageError) {
        return Q.reject(reason);
    }
    if (reason.code === 'ENOENT') {
        return Q.reject(new StorageError('not_found', 404, reason));
    }
    return Q.reject(new StorageError('unknown_error', 500, reason));
}

module.exports = Storage;
module.exports.Error = StorageError;
module.exports.reject = reject;
