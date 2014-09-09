'use strict';

var
    util = require('util'),
    path = require('path'),
    Q = require('q'),
    debug = require('debug')('pictor:converter'),
    DEBUG = debug.enabled;

//
//
//

/**
 * superclass for converter specific error.
 *
 * @param {string} [message='unknown']
 * @param {number} [code=0]
 * @param {*} [cause]
 * @constructor
 * @abstract
 */
function ConverterError(message, code, cause) {
    this.message = message || 'unknown';
    this.code = code || 0;
    this.cause = cause;
    ConverterError.super_.call(this, message);
}
util.inherits(ConverterError, Error);
ConverterError.prototype.name = 'ConverterError';
ConverterError.prototype.toString = function () {
    return 'ConverterError: ' + this.message;
};

//
//
//

/**
 * abstract parent class of storage adapter.
 *
 * `config` contains:
 *
 *    - ...
 *
 * @param {object} config
 * @constructor
 * @abstract
 */
function Converter(config) {
    this.config = config;
}

Converter.prototype.getVariation = function (opts) {
    return Object.keys(opts).reduce(function (result, key) {
        if (key !== 'src' && key !== 'dst') {
            result.push(encodeURIComponent(key));
            result.push(encodeURIComponent(opts[key]));
        }
        return result;
    }, []).join('_');
};

Converter.prototype.getExtension = function (opts) {
    return opts.format || (opts.src && path.extname(opts.src).substring(1)) || this.config.format || 'bin';
};

/**
 * convert a file.
 *
 * @param {*} [opts]
 * @param {string|stream|buffer} opts.src local path to source file or readable stream or buffer
 * @param {string|stream|buffer} opts.dst local path to destination file or writable stream or buffer
 * @returns {promise}
 */
Converter.prototype.convert = function (opts) {
    DEBUG && debug('converter.convert:', opts);
    return Converter.reject(new Converter.Error('not_implemented', 501));
};

/**
 * convenient func to reject promise with the given cause.
 *
 * @param {Error|*} [reason]
 * @returns {promise} always rejected promise
 */
function reject(reason) {
    if (reason instanceof ConverterError) {
        return Q.reject(reason);
    }
    if (reason.code === 'ENOENT') {
        return Q.reject(new ConverterError('not_found', 404, reason));
    }
    return Q.reject(new ConverterError('unknown_error', 500, reason));
}

//
//
//

module.exports = Converter;
module.exports.Error = ConverterError;
module.exports.reject = reject;
