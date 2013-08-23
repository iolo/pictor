'use strict';

var
  providers = {
    'local': require('./local').LocalStorageProvider,
    'ftp': require('./ftp').FtpStorageProvider,
    's3': require('./s3').S3StorageProvider
    //'gcs': require('./gcs').GCSStorageProvider,
    //'gridfs': require('./gridfs').GridFSStorageProvider
  };

/**
 * register a storage provider.
 *
 * @param {string} name
 * @param {function} ctor constructor function
 */
function registerProvider(name, ctor) {
  providers[name] = ctor;
}

/**
 * create a storage provider.
 *
 * @param {string} name
 * @param {object} config
 * @returns {object} a provider instance or `null`
 */
function createProvider(name, config) {
  var ProviderCtor = providers[name];
  return ProviderCtor ? new ProviderCtor(config) : null;
}

module.exports = {
  registerProvider: registerProvider,
  createProvider: createProvider
};
