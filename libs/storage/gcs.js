'use strict';

var
  util = require('util'),
  StorageProvider = require('./storage').StorageProvider,
  debug = require('debug')('pictor:storage:gcs'),
  DEBUG = debug.enabled;

/**
 * GCS(Google Cloud Storage) based implementation of {@link StorageProvider}.
 *
 * `config` contains:
 *
 *    - ...
 *
 * @param config
 * @constructor
 */
function GCSStorageProvider(config) {
  GCSStorageProvider.super_.apply(this, arguments);
  DEBUG && debug('create gcs storage provider: ', config);
}
util.inherits(GCSStorageProvider, StorageProvider);

// TODO: ...

module.exports = {
  GCSStorageProvider: GCSStorageProvider
};
