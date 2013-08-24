'use strict';

var
  util = require('util'),
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

/**
 * convert a file.
 *
 * @param {string|Stream} src
 * @param {string|Stream} [dst]
 * @param {object} [opts]
 * @return {Promise}
 */
Converter.prototype.convert = function (src, dst, opts) {
  DEBUG && debug('converter.convert:', src, '--->', dst, opts);
  throw new Error('abstract method');
};

module.exports = {
  ConverterError: ConverterError,
  Converter: Converter
};
