'use strict';

var
  util = require('util'),
  storage = require('./storage'),
  debug = require('debug')('pictor:storage:gcs'),
  DEBUG = debug.enabled;

/**
 * GCS(Google Cloud Storage) based implementation of {@link Storage}.
 *
 * `config` contains:
 *
 *    - ...
 *
 * @param config
 * @constructor
 */
function GCSStorage(config) {
  GCSStorage.super_.apply(this, arguments);
  DEBUG && debug('create gcs storage:', config);
}
util.inherits(GCSStorage, storage.Storage);

// TODO: ...

module.exports = GCSStorage;
