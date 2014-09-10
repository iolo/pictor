'use strict';

/**
 * CRUD routes.
 *
 * @module pictor.routes.files
 */

var
    http = require('http'),
    pictor = require('../pictor'),
    getFileId = require('../id_base36'),
    base = require('./base'),
    errors = require('express-toybox').errors,
    debug = require('debug')('pictor:routes:files'),
    DEBUG = !!debug.enabled;

/**
 * @api {post} /upload upload multiple files
 * @apiName uploadMulti
 * @apiGroup pictor
 * @apiDescription upload multiple files with `multipart/upload-data`.
 *
 * @apiParam {file|array} file one or more file data as a part of multipart/upload-data
 * @apiParam {string|array} [id='new'] zero or more identifiers for each file(with optional extension to guess mime type)
 * @apiParam {string|array} [prefix=''] zero or more prefixes for each generated identifiers when id is 'new'
 * @apiParam {boolean} [iframe=false] wrap with 'textarea' and send as text/html
 *
 * @apiSuccessStructure result
 * @apiErrorStructure error
 */
function uploadFiles(req, res) {
    // NOTE: file field name should be 'file'
    var files = req.files && Array.prototype.concat(req.files.file);
    if (!files || files.length === 0) {
        return base.sendError(req, res, new errors.BadRequest('required_param_file'));
    }
    var idParam = Array.prototype.concat(req.param('id'));
    var prefixParam = Array.prototype.concat(req.param('prefix'));
    // FIXME: express ignore parameter order... need to change api spec.

    // map each file part to putFile promise...
    var putFiles = files.map(function (file, index) {
        var type = file.headers['content-type'];
        return pictor.putFile(getFileId(idParam[index], prefixParam[index], type), file.path);
    });
    return base.sendResultDefer(req, res, Q.all(putFiles));
}

/**
 * @api {post} /upload upload a file
 * @apiName upload
 * @apiGroup pictor
 * @apiDescription upload a single file with `multipart/form-data`.
 *
 * @apiParam {file} file file data as a part of multipart/form-data
 * @apiParam {string} [id='new'] identifier for the file(with optional extension to guess mime type)
 * @apiParam {string} [prefix=''] prefix for generated identifier when id is 'new'
 *
 * @apiSuccessStructure result
 * @apiErrorStructure error
 */
function uploadFile(req, res) {
    // NOTE: file field name should be 'file'
    var file = req.files && req.files.file && req.files.file[0];
    if (!file) {
        return base.sendError(req, res, new errors.BadRequest('required_param_file'));
    }
    if (!file.size) {
        return base.sendError(req, res, new errors.BadRequest('invalid_param_file'));
    }

    var id = req.param('id');
    var prefix = req.param('prefix');
    var type = file.headers['content-type'];
    return base.sendResultDefer(req, res, pictor.putFile(getFileId(id, prefix, type), file.path));
}

/**
 * @api {put} /upload upload a file with raw data
 * @apiName uploadRaw
 * @apiGroup pictor
 * @apiDescription upload a single file with raw data.
 *
 * @apiParam {file} file file data as raw binary
 * @apiParam {string} [id='new'] identifier for the file
 * @apiParam {string} [prefix=''] the prefix for generated identifier(used for when id is 'new')
 *
 * @apiSuccessStructure result
 * @apiErrorStructure error
 */
function uploadFileRaw(req, res) {
    var id = req.param('id');
    var prefix = req.param('prefix');
    var type = req.get('content-type');

    // req is stream.Readable!
    return base.sendResultDefer(req, res, pictor.putFile(getFileId(id, prefix, type), req));
}

/**
 * @api {get} /upload upload a file with url
 * @apiName uploadUrl
 * @apiGroup pictor
 * @apiDescription upload a single file with public url
 *
 * @apiParam {string} url public url to download file data.
 * @apiParam {string} [id='new'] identifier for the file
 * @apiParam {string} [prefix=''] the prefix for generated identifier(used for when id is 'new')
 *
 * @apiSuccessStructure result
 * @apiErrorStructure error
 */
function uploadFileUrl(req, res) {
    var url = req.param('url');
    if (!url) {
        return base.sendError(req, res, new errors.BadRequest('required_param_url'));
    }

    http.get(url)
        .on('response', function (clientRes) {
            if (clientRes.statusCode < 200 || clientRes.statusCode >= 300) {
                DEBUG && debug('failed to upload url: url=', url, 'status=', clientRes.statusCode);
                var body = [];
                return clientRes
                    .on('data', function (chunk) {
                        body.push(chunk);
                    })
                    .on('end', function () {
                        var cause = {
                            status: clientRes.statusCode,
                            headers: clientRes.headers,
                            body: body.join('')
                        };
                        return base.sendError(req, res, new errors.BadRequest('invalid_param_url', cause));
                    });
            }

            var id = req.param('id');
            var prefix = req.param('prefix');
            var type = clientRes.headers['content-type'];
            // clientRes is stream.Readable!
            return base.sendResultDefer(req, res, pictor.putFile(getFileId(id, prefix, type), clientRes));
        })
        .on('error', function (err) {
            DEBUG && debug('failed to upload url: url=', url, 'err=', err);
            return base.sendError(req, res, new errors.BadRequest('invalid_param_url', err));
        });
}

/**
 * @api {delete} /delete delete a file
 * @apiName delete
 * @apiGroup pictor
 * @apiDescription delete a file and all variants of the file.
 *
 * @apiParam {string} id identifier
 *
 * @apiSuccessStructure accepted
 * @apiErrorStructure error
 */
function deleteFile(req, res) {
    var id = req.param('id');

    return base.sendResultDefer(req, res, pictor.deleteFile(id), errors.StatusCode.ACCEPTED);
}

/**
 * @api {get} /download download a file
 * @apiName download
 * @apiGroup pictor
 * @apiDescription download a file.
 *
 * @apiParam {string} id identifier
 * @apiParam {string} [fallback] fallback file identifier or url served instead of error.
 *
 * @apiSuccessStructure file
 * @apiErrorStructure error
 */
function downloadFile(req, res) {
    var id = req.param('id');

    return base.sendFileDefer(req, res, pictor.getFile(id));
}

/**
 * @api {put} /rename/:id/:target rename a file
 * @apiName renameFile
 * @apiGroup pictor_experimental
 * @apiDescription rename a file. all variants of the file are deleted.
 *
 * @apiParam {string} id identifier
 * @apiParam {string} target target identifier renamed to
 *
 * @apiSuccessStructure accepted
 * @apiErrorStructure error
 */
function renameFile(req, res) {
    var id = req.strParam('id');
    var target = req.strParam('target');

    return base.sendResultDefer(req, res, pictor.renameFile(id, target), errors.StatusCode.ACCEPTED);
}

/**
 * @api {get} /files list files
 * @apiName listFiles
 * @apiGroup pictor_experimental
 * @apiDescription list files
 *
 * @apiParam {string} [prefix]
 * @apiParam {string} [format]
 * @apiParam {number} [skip]
 * @apiParam {number} [limit]
 *
 * @apiSuccessStructure result
 * @apiErrorStructure error
 */
function listFiles(req, res) {
    var prefix = req.strParam('prefix', '');
    var format = req.strParam('format', '');
    var skip = req.intParam('skip', 0);
    var limit = req.intParam('limit', 0);

    return base.sendResultDefer(req, res, pictor.listFiles({prefix: prefix, format: format, skip: skip, limit: limit}));
}

module.exports = {
    uploadFiles: uploadFiles,
    uploadFile: uploadFile,
    uploadFileRaw: uploadFileRaw,
    uploadFileUrl: uploadFileUrl,
    deleteFile: deleteFile,
    downloadFile: downloadFile,
    renameFile: renameFile,
    listFiles: listFiles
};