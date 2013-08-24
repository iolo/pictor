'use strict';

var
  util = require('util'),
  storage = require('./storage'),
  debug = require('debug')('pictor:storage:gridfs'),
  DEBUG = debug.enabled;

/**
 * GridFS(mongodb) based implementation of {@link Storage}.
 *
 * `config` contains:
 *
 *    - ...
 *
 * @param config
 * @constructor
 */
function GridFSStorage(config) {
  GridFSStorage.super_.apply(this, arguments);
  DEBUG && debug('create gridfs storage:', config);
}
util.inherits(GridFSStorage, storage.Storage);

// TODO: ...

module.exports = GridFSStorage;
