'use strict';

/** @module pictor.storage.gcs */

var
    util = require('util'),
    Storage = require('./storage'),
    debug = require('debug')('pictor:storage:gcs'),
    DEBUG = debug.enabled;

/**
 * GCS(Google Cloud Storage) based implementation of {@link Storage}.
 *
 * `config` contains:
 *
 *    - ...
 *
 * @param {object} config
 * @constructor
 */
function GCSStorage(config) {
    GCSStorage.super_.apply(this, arguments);
    DEBUG && debug('create gcs storage:', this.config);
}
util.inherits(GCSStorage, Storage);

// TODO: ...

module.exports = GCSStorage;
