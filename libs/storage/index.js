'use strict';

var
    storages = {
        'local': require('./local'),
        'ftp': require('./ftp'),
        's3': require('./s3')
        //'gcs': require('./gcs'),
        //'gridfs': require('./gridfs')
    };

/**
 * register a storage.
 *
 * @param {string} name
 * @param {function} ctor constructor function of the storage
 */
function registerStorage(name, ctor) {
    storages[name] = ctor;
}

/**
 * create a storage.
 *
 * @param {string} name
 * @param {object} config
 * @returns {object} a storage instance or `null`
 */
function createStorage(name, config) {
    var StorageCtor = storages[name];
    return StorageCtor ? new StorageCtor(config) : null;
}

module.exports = {
    registerStorage: registerStorage,
    createStorage: createStorage
};
