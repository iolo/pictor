'use strict';

/**
 * restful(?) aliases of CRUD routes.
 *
 * @module pictor.routes.rest
 */

var files = require('./files'),
    debug = require('debug')('pictor:routes:rest'),
    DEBUG = !!debug.enabled;

/**
 * @api {post} /{id} upload a file
 * @apiName uploadRestful
 * @apiGroup pictor_restful
 * @apiDescription upload a single file with `multipart/form-data`.
 * convenient alias of `upload` api.
 *
 * @apiParam {file} file file data as a part of multipart/form-data
 * @apiParam {string} [id='new'] identifier for the file(with optional extension to guess mime type)
 * @apiParam {string} [prefix=''] prefix for generated identifier when id is 'new'
 *
 * @apiSuccessStructure result
 * @apiErrorStructure error
 */

/**
 * @api {put} /{id} upload a file with raw data
 * @apiName uploadRawRestful
 * @apiGroup pictor_restful
 * @apiDescription upload a single file with raw data.
 * convenient alias of `uploadRaw` api.
 *
 * @apiParam {file} file file data as raw binary
 * @apiParam {string} [id='new'] identifier for the file
 * @apiParam {string} [prefix=''] the prefix for generated identifier(used for when id is 'new')
 *
 * @apiSuccessStructure result
 * @apiErrorStructure error
 */

/**
 * @api {delete} /{id} delete a file
 * @apiName deleteRestful
 * @apiGroup pictor_restful
 * @apiDescription delete a file and all variants of the file.
 * convenient alias of `delete` api.
 *
 * @apiParam {string} id identifier
 *
 * @apiSuccessStructure accepted
 * @apiErrorStructure error
 */

/**
 * @api {get} /{id} download a file
 * @apiName downloadRestful
 * @apiGroup pictor_restful
 * @apiDescription download a file.
 * convenient alias of `download` api.
 *
 * @apiParam {string} id identifier
 *
 * @apiSuccessStructure accepted
 * @apiErrorStructure error
 */

module.exports = {
    uploadFileRestful: files.uploadFile,
    uploadFileRawRestful: files.uploadFileRaw,
    deleteFileRestful: files.deleteFile,
    downloadFileRestful: files.downloadFile
};

