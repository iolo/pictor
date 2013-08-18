'use strict';

var
  providers = {
    'local': require('./local').LocalStorageProvider,
    'ftp': require('./ftp').FtpStorageProvider,
    's3': require('./ftp').S3StorageProvider,
    'gcs': require('./ftp').GCSStorageProvider,
    'gridfs': require('./ftp').GridFSStorageProvider
  };

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
  createProvider: createProvider
};