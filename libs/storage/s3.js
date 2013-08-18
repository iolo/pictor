'use strict';

var
  util = require('util'),
  StorageProvider = require('./storage').StorageProvider,
  debug = require('debug')('pictor:storage:s3'),
  DEBUG = debug.enabled;

/**
 * Amazon S3 based implementation of {@link StorageProvider}.
 *
 * `config` contains:
 *
 *    - ...
 *
 * @param {object} config
 * @constructor
 */
function S3StorageProvider(config) {
  S3StorageProvider.super_.apply(this, arguments);
  DEBUG && debug('create s3 storage provider: ', config);
}
util.inherits(S3StorageProvider, StorageProvider);

// TODO: ...

module.exports = {
  S3StorageProvider: S3StorageProvider
};
