'use strict';

var
  util = require('util'),
  StorageProvider = require('./storage').StorageProvider,
  debug = require('debug')('pictor:storage:gridfs'),
  DEBUG = debug.enabled;

/**
 * GridFS(mongodb) based implementation of {@link StorageProvider}.
 *
 * `config` contains:
 *
 *    - ...
 *
 * @param config
 * @constructor
 */
function GridFSStorageProvider(config) {
  GridFSStorageProvider.super_.apply(this, arguments);
  DEBUG && debug('create gridfs storage provider: ', config);
}
util.inherits(GridFSStorageProvider, StorageProvider);

// TODO: ...

module.exports = {
  GridFSStorageProvider: GridFSStorageProvider
};
