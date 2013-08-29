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
 * abstract superclass for storage specific error.
 *
 * @param {string} [message='unknown']
 * @param {number} [status=0]
 * @param {*} [cause]
 * @constructor
 * @abstract
 */
function ConverterError(message, status, cause) {
  this.message = message || 'unknown';
  this.status = status || 0;
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
  return Object.keys(opts).reduce(function(result, key) {
    if (key !== 'src' && key !== 'dst') {
      result.push(encodeURIComponent(key));
      result.push(encodeURIComponent(opts[key]));
    }
    return result;
  }, []).join('_');
};

Converter.prototype.getExtension = function (opts) {
  return null;//opts.format || path.extname(opts.src).substring(1) || 'bin';
};

/**
 * convert a file.
 *
 * @param {object} [opts]
 * @param {string|Stream} opts.src
 * @param {string|Stream} [opts.dst]
 * @return {Promise}
 */
Converter.prototype.convert = function (opts) {
  DEBUG && debug('converter.convert:', opts);
  return Q.reject(new Error('abstract method'));
};

module.exports = {
  ConverterError: ConverterError,
  Converter: Converter
};
