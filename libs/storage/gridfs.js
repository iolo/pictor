'use strict';

/** @module pictor.storage.gridfs */

var
    util = require('util'),
    Storage = require('./storage'),
    debug = require('debug')('pictor:storage:gridfs'),
    DEBUG = debug.enabled;

/**
 * GridFS(mongodb) based implementation of {@link Storage}.
 *
 * `config` contains:
 *
 *    - ...
 *
 * @param {object} config
 * @constructor
 */
function GridFSStorage(config) {
    GridFSStorage.super_.apply(this, arguments);
    DEBUG && debug('create gridfs storage:', this.config);
}
util.inherits(GridFSStorage, Storage);

// TODO: ...

module.exports = GridFSStorage;
