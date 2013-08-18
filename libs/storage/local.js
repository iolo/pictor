'use strict';

var
  util = require('util'),
  fileutils = require('../fileutils'),
  StorageProvider = require('./storage').StorageProvider,
  debug = require('debug')('pictor:storage:local'),
  DEBUG = debug.enabled;

/**
 * local file system based implementation of {@link StorageProvider}
 *
 * @param config
 * @constructor
 */
function LocalStorageProvider(config) {
  LocalStorageProvider.super_.apply(this, arguments);
  DEBUG && debug('create local storage provider: ', config);
}
util.inherits(LocalStorageProvider, StorageProvider);

LocalStorageProvider.prototype.exists = function (storagePath) {
  DEBUG && debug('local.exists', storagePath);
  return fileutils.exists(storagePath);
};

LocalStorageProvider.prototype.putFile = function (filePath, storagePath) {
  DEBUG && debug('local.putFile', filePath, '---->', storagePath);
  return fileutils.copyFile(filePath, storagePath);
};

LocalStorageProvider.prototype.getFile = function (filePath, storagePath) {
  DEBUG && debug('local.getFile', filePath, '<----', storagePath);
  return fileutils.copyFile(storagePath, filePath);
};

LocalStorageProvider.prototype.deleteFile = function (storagePath) {
  DEBUG && debug('local.deleteFile', storagePath);
  return fileutils.deleteFile(storagePath);
};

module.exports = {
  LocalStorageProvider: LocalStorageProvider
};
