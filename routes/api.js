'use strict';

var
    util = require('util'),
    http = require('http'),
    Q = require('q'),
    _ = require('lodash'),
    express = require('express'),
    mime = require('mime'),
    pictor = require('../libs/pictor'),
    errors = require('express-toybox').errors,
    debug = require('debug')('pictor:routes:api'),
    DEBUG = debug.enabled;

var
    DEF_REDIRECT_STATUS_CODE = false,//or 301,302,307
    redirectStatusCode;

var
    ID_NEW = 'new',
    ID_REGEX = /^[\w\-]+(\.\w+)?/,// /[^a-zA-Z0-9가-힣-_.]/
    DEF_PREFIX = '',
    DEF_SUFFIX = '';

/**
 * generate unique identifier.
 *
 * @param prefix
 * @param suffix
 * @returns {string}
 * @private
 */
function _generateUniqueId(prefix, suffix) {
    return [
        prefix || '',
        Date.now().toString(36),
        '-',
        (Math.random() * 0x100000000).toString(36),
        suffix || ''
    ].join('');
}

/**
 * generate new file and unique file identifier.
 *
 * @param {string} [id='new'] identifier for the file
 * @param {string} [prefix=''] prefix for generated identifier(only if id is 'new')
 * @param {string} [type=''] mime type to determine file extension for for generated identifier(only if id is 'new')
 * @returns {string}
 */
function _getFileId(id, prefix, type) {
    if (!id) {
        throw 'required_param_id';
    }
    if (id === ID_NEW) {
        return _generateUniqueId(prefix || DEF_PREFIX, type ? '.' + mime.extension(type) : DEF_SUFFIX);
    }
    if (ID_REGEX.test(id)) {
        return id;
    }
    throw 'invalid_param_id';
}

//
//
//

/**
 * @apiDefineSuccessStructure file
 *
 * @apiSuccessExample 200 ok
 *    HTTP/1.1 200 OK
 *    file binary...
 *
 * @apiSuccessExample 301 move permanently
 *    HTTP/1.1 301 Moved Permanently
 *    Location: http://...
 *
 * @apiSuccessExample 302 found
 *    HTTP/1.1 302 Found
 *    Location: http://...
 *
 * @apiSuccessExample 307 temporary redirect
 *    HTTP/1.1 307 Temporary Redirect
 *    Location: http://...
 */

/**
 * @apiDefineSuccessStructure result
 *
 * @apiSuccess {string} id file identifier
 * @apiSuccess {string} [url] public http url(only if storage provides)
 * @apiSuccess {string} [file] local file path(debug mode only)
 * @apiSuccessExample 200 ok
 *    HTTP/1.1 200 OK
 *    Content-Type: application/json
 *    {id: "foo", url: "http://...", ...}
 *
 * @apiSuccessExample 200 ok(array)
 *    HTTP/1.1 200 OK
 *    Content-Type: application/json
 *    [
 *      {id: "foo", url: "http://...", ...},
 *      {id: "bar", url: "http://...", ...},
 *      ...
 *    ]
 *
 * @apiSuccessExample 200 ok(for jsonp)
 *    HTTP/1.1 200 OK
 *    Content-Type: application/javascript
 *    callback({id: "foo", url: "http://...", ...})
 *
 * @apiSuccessExample 200 ok(for iframe)
 *    HTTP/1.1 200 OK
 *    Content-Type: text/html
 *    &lt;textarea&gt;{id: "foo", url: "http://...",  ...}&lt;/textarea&gt;
 */

/**
 * @apiDefineSuccessStructure accepted
 *
 * @apiSuccessExample 202 accepted
 *    HTTP/1.1 202 OK
 */

/**
 * @apiDefineErrorStructure error
 *
 * @apiError {*} error
 * @apiError {number} error.status status code
 * @apiError {string} error.message error message
 * @apiError {number} [error.code] pictor specific error code(only if error.status is 500)
 * @apiError {*} [error.cause] internal error object(debug mode only)
 * @apiError {*} [error.stack] stack trace(debug mode only)
 * @apiErrorExample 400 bad request
 *    HTTP/1.1 400 Bad Request
 *    Content-Type: application/json
 *    {
 *      error: {
 *        status: 400,
 *        message: "required_param_file"
 *      }
 *    }
 * @apiErrorExample 404 not found
 *    HTTP/1.1 404 Not Found
 *    Content-Type: application/json
 *    {
 *      error: {
 *        status: 404,
 *        message: "file_not_found"
 *      }
 *    }
 * @apiErrorExample 500 internal server error
 *    HTTP/1.1 500 internal server error
 *    Content-Type: application/json
 *    {
 *      error: {
 *        status: 500,
 *        message: "internal_server_error",
 *        code: 90100
 *      }
 *    }
 * @apiSuccessExample 500 internal server error(for jsonp)
 *    HTTP/1.1 500 internal server error
 *    Content-Type: application/javascript
 *    callback({error:{status: 500, ...})
 * @apiSuccessExample 500 internal server error(for iframe)
 *    HTTP/1.1 500 internal server error
 *    Content-Type: text/html
 *    &lt;textarea&gt;{error:{status: 500, ...}&lt;/textarea&gt;
 */

//
//
//

/**
 * wrap result with 'textearea' tag and send as 'text/html'.
 *
 * @param {*} res
 * @param {number} status
 * @param {*} result
 * @returns {*}
 * @private
 */
function _sendResponseIframe(res, status, result) {
    res.type('html');
    return res.send('<textarea data-type="application/json" data-status="' + status + '">' + JSON.stringify(result) + '</textarea>');
}

/**
 * send error response.
 *
 * @param {*} req
 * @param {*} res
 * @param {*} [err]
 * @param {number} [err.status]
 * @param {string} [err.message]
 * @param {number} [err.code]
 * @param {*} [err.cause]
 * @returns {*}
 * @private
 */
function _sendError(req, res, err) {
    DEBUG && debug('*** send error', err);

    // TODO: cleanup error response...
    var status = (err && err.status) || 500;
    var error = {
        error: {
            status: status,
            message: (err && err.message) || 'internal server error',
            code: (err && err.code) || 0,
            cause: err,
            stack: (err && err.stack && err.stack.split('\n')) || []
        }
    };

    if (!!req.param('iframe')) {
        return _sendResponseIframe(res, status, error);
    }

    return res.jsonp(status, error);
}

/**
 * send success response with result data(json).
 *
 * result is one of followings:
 * - 200 ok with json contains id, url, ...
 * - 200 ok with jsonp contains id, url, ...(when request param 'callback' is set)
 * - 200 ok with html contains id, url, ...(when request param 'iframe' is set)
 *
 * @param {*} req
 * @param {*} res
 * @param {PictorFile|Array.<PictorFile>} result
 * @returns {*}
 * @private
 */
function _sendResult(req, res, result) {
    DEBUG && debug('*** send result', result);

    if (!_.isObject(result) && !_.isArray(result)) {
        return _sendError(req, res); // internal server error
    }

    if (!!req.param('iframe')) {
        return _sendResponseIframe(res, 200, result);
    }

    return res.jsonp(result);
}

/**
 * send success response with file binary or redirect.
 *
 * result is one of followings:
 * - 200 ok with file binary(download or proxy)
 * - 301,302,307 redirect
 *
 * @param {*} req
 * @param {*} res
 * @param {PictorFile|array.<PictorFile>} result
 * @returns {*}
 * @private
 */
function _sendFile(req, res, result) {
    if (!_.isObject(result)) {
        return _sendError(req, res); // internal server error
    }

    if (redirectStatusCode) { // redirect is enabled by configuration
        if (result.url) {
            DEBUG && debug('*** redirect:', redirectStatusCode, result.url);
            return res.redirect(redirectStatusCode, result.url);
        } else {
            DEBUG && debug('*** redirect fail! storage does not provide url!');
        }
    }
    if (result.type) {
        res.type(result.type);
    }
    var disposition = req.param('disposition');
    if (disposition) {
        var filename = req.param('filename');
        if (filename) {
            disposition += ';' + filename;
        }
        res.set('Content-Disposition', disposition); // (inline|attachment)[; filename=...]
    }
    if (result.stream) {
        DEBUG && debug('*** send stream');
        return result.stream.pipe(res);
    }
    if (result.file) {
        DEBUG && debug('*** send file:', result.file);
        return res.sendfile(result.file);
    }
    // redirect is disabled by configuration,
    // neither file nor stream is available...
    // try manual proxy...
    if (result.url) {
        DEBUG && debug('*** manual proxy:', result.url);
        return http.get(result.url, function (response) {
            return response.pipe(res);
        });
    }
    // no way to download!!! error??
    return _sendError(req, res); // internal server error
}

/**
 * send response with file binary or redirect if fallback provided, otherwise send error.
 *
 * @param {*} req
 * @param {*} res
 * @param {*} err original error
 * @returns {*}
 * @private
 */
function _sendFallbackOrError(req, res, err) {
    var fallback = req.param('fallback');
    if (fallback) {
        DEBUG && debug('***ignore*** download fallback:', fallback);
        // fallback to url
        if (fallback && /^https?:\/\//.test(fallback)) {
            return {url: fallback};
        }
        // fallback to file id
        return pictor.getFile(fallback)
            .then(function (result) {
                return _sendFile(req, res, result);
            })
            .fail(function (fallbackErr) {
                DEBUG && debug('***ignore*** failed to download fallback:', fallbackErr);
                return _sendError(req, res, err);
            })
            .done();
    }
    return _sendError(req, res, err);
}

/**
 * send success response without content
 *
 * result is one of followings:
 * - 201 created
 * - 202 accepted
 * - 204 no content
 *
 * @param {*} req
 * @param {*} res
 * @param {number} status
 * @returns {*}
 * @private
 */
function _sendStatus(req, res, status) {
    return res.send(status);
}

/**
 * get all params for convert apis.
 *
 * XXX: is this secure??
 * i don't know which params are required for the converter
 * so, i'll pass all params available here...
 *
 * @param {*} req
 * @returns {*}
 * @private
 */
function _getConvertParams(req) {
    return _.extend({}, req.params, req.query, req.body);
}

//
//
//

/**
 * @api {post} /pictor/upload upload multiple files
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
        return _sendError(req, res, new errors.BadRequest('required_param_file'));
    }
    var idParam = Array.prototype.concat(req.param('id'));
    var prefixParam = Array.prototype.concat(req.param('prefix'));
    // FIXME: express ignore parameter order... need to change api spec.

    return Q.all(files.map(function (file, index) {
            var type = file.headers['content-type'];
            return pictor.putFile(_getFileId(idParam[index], prefixParam[index], type), file.path);
        }))
        .then(function (result) {
            return _sendResult(req, res, result);
        })
        .fail(function (err) {
            return _sendError(req, res, err);
        })
        .done();
}

/**
 * @api {post} /pictor/upload upload a file
 * @apiName upload
 * @apiGroup pictor
 * @apiDescription upload a single file with `multipart/form-data`.
 *
 * @apiParam {file} file file data as a part of multipart/upload-data
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
        return _sendError(req, res, new errors.BadRequest('required_param_file'));
    }
    if (!file.size) {
        return _sendError(req, res, new errors.BadRequest('invalid_param_file'));
    }

    var id = req.param('id');
    var prefix = req.param('prefix');
    var type = file.headers['content-type'];
    return pictor.putFile(_getFileId(id, prefix, type), file.path)
        .then(function (result) {
            return _sendResult(req, res, result);
        })
        .fail(function (err) {
            return _sendError(req, res, err);
        })
        .done();
}

/**
 * @api {put} /pictor/upload upload a file with raw data
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
    return pictor.putFile(_getFileId(id, prefix, type), req)
        .then(function (result) {
            return _sendResult(req, res, result);
        })
        .fail(function (err) {
            return _sendError(req, res, err);
        })
        .done();
}

/**
 * @api {get} /pictor/upload upload a file with url
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
        return _sendError(req, res, new errors.BadRequest('required_param_url'));
    }

    http.get(url)
        .on('response', function (clientRes) {
            if (clientRes.statusCode < 200 || clientRes.statusCode >= 300) {
                DEBUG && debug('failed to upload url: url=', url, 'status=', clientRes.statusCode);
                var body = [];
                return clientRes
                    .on('data',function (chunk) {
                        body.push(chunk);
                    }).on('end', function () {
                        var cause = {
                            status: clientRes.statusCode,
                            headers: clientRes.headers,
                            body: body.join('')
                        };
                        return _sendError(req, res, new errors.BadRequest('invalid_param_url', cause));
                    });
            }

            var id = req.param('id');
            var prefix = req.param('prefix');
            var type = clientRes.headers['content-type'];
            // clientRes is stream.Readable!
            return pictor.putFile(_getFileId(id, prefix, type), clientRes)
                .then(function (result) {
                    return _sendResult(req, res, result);
                })
                .fail(function (err) {
                    return _sendError(req, res, err);
                })
                .done();
        })
        .on('error', function (err) {
            DEBUG && debug('failed to upload url: url=', url, 'err=', err);
            return _sendError(req, res, new errors.BadRequest('invalid_param_url', err));
        });
}

/**
 * @api {delete} /pictor/delete delete a file
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

    return pictor.deleteFile(id)
        .then(function () {
            return _sendStatus(req, res, errors.StatusCode.ACCEPTED);
        })
        .fail(function (err) {
            return _sendError(req, res, err);
        })
        .done();
}

/**
 * @api {get} /pictor/download download a file
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

    return pictor.getFile(id)
        .then(function (result) {
            return _sendFile(req, res, result);
        })
        .fail(function (err) {
            return _sendFallbackOrError(req, res, err);
        })
        .done();
}

/**
 * @api {put} /pictor/rename/:id/:target rename a file
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

    return pictor.renameFile(id, target)
        .then(function () {
            return _sendStatus(req, res, errors.StatusCode.ACCEPTED);
        })
        .fail(function (err) {
            return _sendError(req, res, err);
        })
        .done();
}

/**
 * @api {get} /pictor/files list files
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

    return pictor.listFiles({prefix: prefix, format: format, skip: skip, limit: limit})
        .then(function (result) {
            return _sendResult(req, res, result);
        })
        .fail(function (err) {
            return _sendError(req, res, err);
        })
        .done();
}

/**
 * @apiDefineStructure convertRequest
 *
 * @apiParam {string} [converter='preset'] 'preset', 'convert', 'resize', 'thumbnail', 'crop', 'resizecrop', 'meta', 'exif', 'holder', ...
 * @apiParam {string} [id] input file identifier. required except 'holder' converter.
 * @apiParam {string} [format] output file format. if not specified, use source file format or converter default format.
 * @apiParam {number} [preset] preset name. used 'preset' converter only.
 * @apiParam {number} [w] width in pixels. used for 'resize', 'thumbnail', 'crop', holder' converters.
 * @apiParam {number} [h] height in pixels. used for 'resize', 'thumbnail', 'crop', holder' converters.
 * @apiParam {number} [x] distance in pixel from the left edge. used for 'crop', 'cropresize', 'resizecrop' converters.
 * @apiParam {number} [y] distance in pixels from the top edge. used for 'crop', 'cropresize', 'resizecorp' converters.
 * @apiParam {number} [nw] resize width before/after crop. used for 'cropresize' and 'resizecrop' converters.
 * @apiParam {number} [nh] resize height before/after crop. used for 'cropresize' and 'resizecrop' converters.
 * @apiParam {string} [flags] resize flags. used for 'resize' and 'cropresize' and 'resizecrop' converters.
 * @apiParam {number} [c] preferred number of colors in result image. used for 'resize', 'thumbnail' converters.
 * @apiParam {*} [*] and various converter specific params...
 */

/**
 * @api {post} /pictor/convert convert a file
 * @apiName convert
 * @apiGroup pictor_convert
 * @apiDescription convert a file and keep the result in cache for later use.
 *
 * @apiStructure convertRequest
 *
 * @apiExample resize 'foo.jpg' to 400x300 of png with curl:
 *    curl -X POST -d "converter=resize&id=foo.jpg&format=png&w=400&h=300" http://localhost:3001/pictor/convert
 *
 * @apiSuccessStructure result
 * @apiErrorStructure error
 */
function convertFile(req, res) {
    // TODO: convert multiple files...
    // TODO: support chaining converters...

    var opts = _getConvertParams(req);
    DEBUG && debug('convertFile: opts=', opts);

    return pictor.convertFile(opts)
        .then(function (result) {
            return _sendResult(req, res, result);
        })
        .fail(function (err) {
            return _sendError(req, res, err);
        })
        .done();
}

/**
 * @api {get} /pictor/convert convert and download a file
 * @apiName convertAndDownload
 * @apiGroup pictor_convert
 * @apiDescription convert a file and keep the result in cache for later use and download it.
 *
 * @apiStructure convertRequest
 *
 * @apiParam {string} [fallback] fallback file identifier or url served instead of error.
 *
 * @apiExample resize 'foo.jpg' to 100x100 of png and download it with curl:
 *    curl -X GET -o output.png http://localhost:3001/pictor/convert?converter=resize&id=foo.jpg&format=png&w=100&h=100&fallback=http://link.to/some/image.png
 *
 * @apiSuccessStructure file
 * @apiErrorStructure error
 */
function convertAndDownloadFile(req, res) {
    var opts = _getConvertParams(req);
    DEBUG && debug('convertAndDownloadFile: opts=', opts);

    return pictor.convertFile(opts)
        .then(function (result) {
            return _sendFile(req, res, result);
        })
        .fail(function (err) {
            return _sendFallbackOrError(req, res, err);
        })
        .done();
}

//
//
//

/**
 *  configure middlewares for the express app.
 *
 * @param {express.application} app
 * @param {*} config
 * @param {boolean|number} [config.redirect=false] false,301,302,307
 * @returns {express.application}
 */
function configureMiddlewares(app, config) {
    DEBUG && debug('create pictor middlewares...', config);

    redirectStatusCode = config.redirect || DEF_REDIRECT_STATUS_CODE;

    return app;
}

/**
 * configure routes for the express app.
 *
 * @param {*} app
 * @param {object} config
 * @returns {express.application}
 */
function configureRoutes(app, config) {
    DEBUG && debug('create pictor routes...');

    var prefix = config.prefix || '';

    // TODO: require auth!
//  app.use(function (req, res, next) {
//    if (req.method === 'GET' && !/(upload|delete|rename|files)/.test(req.path)) {
//      return next();
//    }
//    return res.send(new errors.Forbidden());
//  });

    //
    // CRUD routes
    //

    app.post(prefix + '/upload', uploadFiles);
    app.put(prefix + '/upload', uploadFileRaw);
    app.get(prefix + '/upload', uploadFileUrl);
    app.get(prefix + '/delete', deleteFile);
    app.get(prefix + '/download', downloadFile);

    //
    // convert routes
    //

    app.post(prefix + '/convert', convertFile);
    app.get(prefix + '/convert', convertAndDownloadFile);

    //
    // restful(?) aliases of CRUD routes
    //

    /**
     * @api {post} /pictor/{id} upload a file
     * @apiName uploadRestful
     * @apiGroup pictor_restful
     * @apiDescription upload a single file with `multipart/form-data`.
     * convenient alias of `upload` api.
     *
     * @apiParam {file} file file data as a part of multipart/upload-data
     * @apiParam {string} [id='new'] identifier for the file(with optional extension to guess mime type)
     * @apiParam {string} [prefix=''] prefix for generated identifier when id is 'new'
     *
     * @apiSuccessStructure result
     * @apiErrorStructure error
     */
    app.post(prefix + '/:id', uploadFile);

    /**
     * @api {put} /pictor/{id} upload a file with raw data
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
    app.put(prefix + '/:id', uploadFileRaw);

    /**
     * @api {delete} /pictor/{id} delete a file
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
    app.delete(prefix + '/:id', deleteFile);

    /**
     * @api {get} /pictor/{id} download a file
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
    app.get(prefix + '/:id', downloadFile);

    //
    // XXX: experimental for issue #4 and #5
    //

    app.get(prefix + '/rename', renameFile);
    app.get(prefix + '/files', listFiles);

    //
    // convenient aliases of convertAndDownload api using specific converters
    // XXX: this code depends on implementation of built-in converters.
    //

    /**
     * @api {get} /pictor/holder/{width}x{height}.{format} download holder image.
     * @apiName downloadHolderImage
     * @apiGroup pictor_images
     * @apiDescription convenient alias of `convertAndDownload` api using `holder` converter.
     *
     * @apiParam {number} w width in pixels
     * @apiParam {number} h height in pixels
     * @apiParam {string} [format] 'png', 'jpg', 'jpeg' or 'gif'. use source format by default.
     *
     * @apiExample create 400x300 holder of png and download it with curl:
     *    curl -X GET -o output.png http://localhost:3001/pictor/holder/400x300.png
     *
     * @apiSuccessStructure file
     * @apiErrorStructure error
     */
    app.get(new RegExp(prefix + '/holder/(\\d+)x(\\d+)(.(\\w+))?'), function (req, res) {
        req.query.converter = 'holder';
        req.query.w = req.params[0];
        req.query.h = req.params[1];
        req.query.format = req.params[3];
        return convertAndDownloadFile(req, res);
    });

    /**
     * @api {get} /pictor/resize/{id}/{width}x{height}{flags}.{format} download resize image.
     * @apiName downloadResizeImage
     * @apiGroup pictor_images
     * @apiDescription convenient alias of `convertAndDownload` api using `resize` converter.
     *
     * @apiParam {number} w width in pixels
     * @apiParam {number} h height in pixels
     * @apiParam {string} [flags] resizing flags. '!' for force. '%' for percent. '^' for fill area, '<' for enlarge, '>' shrink, '@' for pixels
     * @apiParam {string} [format] 'png', 'jpg', 'jpeg' or 'gif'. use source format by default.
     *
     * @apiExample resize foo.jpg to 400x300(ignore aspect ratio) of png and download it with curl:
     *    curl -X GET -o output.png http://localhost:3001/pictor/resize/foo.jpg/400x300!.png
     *
     * @apiSuccessStructure file
     * @apiErrorStructure error
     */
    app.get(new RegExp(prefix + '/resize/([\\w\\-\\.]+)/(\\d+)x(\\d+)([!%^<>@]?)(.(\\w+))?'), function (req, res) {
        req.query.converter = 'resize';
        req.query.id = req.params[0];
        req.query.w = req.params[1];
        req.query.h = req.params[2];
        req.query.flags = req.params[3];
        req.query.format = req.params[5];
        return convertAndDownloadFile(req, res);
    });

    /**
     * @api {get} /pictor/thumbnail/{id}/{w}x{h}.{format} download thumbnail image.
     * @apiName downloadThumbnailImage
     * @apiGroup pictor_images
     * @apiDescription convenient alias of `convertAndDownload` api using `thumbnail` converter.
     *
     * This will keep aspect-ratio and auto-rotate by exif orientation.
     *
     * @apiParam {number} w width in pixels
     * @apiParam {number} h height in pixels
     * @apiParam {string} [format] 'png', 'jpg', 'jpeg' or 'gif'. use source format by default.
     *
     * @apiExample thumbnail foo.jpg to 400x300 of png and download it with curl:
     *    curl -X GET -o output.png http://localhost:3001/pictor/thumbnail/foo.jpg/400x300.png
     *
     * @apiSuccessStructure file
     * @apiErrorStructure error
     */
    app.get(new RegExp(prefix + '/thumbnail/([\\w\\-\\.]+)/(\\d+)x(\\d+)(.(\\w+))?'), function (req, res) {
        req.query.converter = 'thumbnail';
        req.query.id = req.params[0];
        req.query.w = req.params[1];
        req.query.h = req.params[2];
        req.query.format = req.params[4];
        return convertAndDownloadFile(req, res);
    });

    /**
     * @api {get} /pictor/crop/{id}/{w}x{h}+{x}+{y}.{format} download cropped image.
     * @apiName downloadCropImage
     * @apiGroup pictor_images
     * @apiDescription convenient alias of `convertAndDownload` api using `crop` converter.
     *
     * @apiParam {number} w width in pixels
     * @apiParam {number} h height in pixels
     * @apiParam {number} x distance in pixel from the left edge
     * @apiParam {number} y distance in pixels from the top edge
     * @apiParam {string} [format] 'png', 'jpg', 'jpeg' or 'gif'. use source format by default.
     *
     * @apiExample crop foo.jpg to rectangle(400x300+200+100) of png and download it with curl:
     *    curl -X GET -o output.png http://localhost:3001/pictor/crop/foo.jpg/400x300+200+100.png
     *
     * @apiSuccessStructure file
     * @apiErrorStructure error
     */
    app.get(new RegExp(prefix + '/crop/([\\w\\-\\.]+)/(\\d+)x(\\d+)\\+(\\d+)\\+(\\d+)(.(\\w+))?'), function (req, res) {
        req.query.converter = 'crop';
        req.query.id = req.params[0];
        req.query.w = req.params[1];
        req.query.h = req.params[2];
        req.query.x = req.params[3];
        req.query.y = req.params[4];
        req.query.format = req.params[6];
        return convertAndDownloadFile(req, res);
    });

    /**
     * @api {get} /pictor/rotate/{id}/{degree}.{format} download rotated image.
     * @apiName downloadRotateImage
     * @apiGroup pictor_images
     * @apiDescription convenient alias of `convertAndDownload` api using `rotate` converter.
     *
     * @apiParam {number} clockwise degree amount of rotate
     * @apiParam {string} [format] 'png', 'jpg', 'jpeg' or 'gif'. use source format by default.
     *
     * @apiExample crop foo.jpg to 90deg(clockwise) rotated png and download it with curl:
     *    curl -X GET -o output.png http://localhost:3001/pictor/rotate/foo.jpg/90.png
     *
     * @apiSuccessStructure file
     * @apiErrorStructure error
     */
    app.get(new RegExp(prefix + '/rotate/([\\w\\-\\.]+)/(\\d+)(.(\\w+))?'), function (req, res) {
        req.query.converter = 'rotate';
        req.query.id = req.params[0];
        req.query.degree = req.params[1];
        req.query.format = req.params[3];
        return convertAndDownloadFile(req, res);
    });

    /**
     * @api {get} /pictor/resizecrop/{id}/{nw}x{nh}/{w}x{h}+{x}+{y}.{format} download crop image.
     * @apiName downloadResizeCropImage
     * @apiGroup pictor_images
     * @apiDescription convenient alias of `convertAndDownload` api using `resizecrop` converter.
     *
     * @apiParam {number} [nw] resize width before crop.
     * @apiParam {number} [nh] resize height before crop.
     * @apiParam {number} w width in pixels
     * @apiParam {number} h height in pixels
     * @apiParam {number} x distance in pixel from the left edge
     * @apiParam {number} y distance in pixels from the top edge
     * @apiParam {string} [format] 'png', 'jpg', 'jpeg' or 'gif'. use source format by default.
     *
     * @apiExample resize foo.jpg to 1280x720 and crop to rectangle(400x300+200+100) of png and download it with curl:
     *    curl -X GET -o output.png http://localhost:3001/pictor/resizecrop/foo.jpg/1280x720/400x300+200+100.png
     *
     * @apiSuccessStructure file
     * @apiErrorStructure error
     */
    app.get(new RegExp(prefix + '/resizecrop/([\\w\\-\\.]+)/(\\d+)x(\\d+)/(\\d+)x(\\d+)\\+(\\d+)\\+(\\d+)(.(\\w+))?'), function (req, res) {
        req.query.converter = 'resizecrop';
        req.query.id = req.params[0];
        req.query.nw = req.params[1];
        req.query.nh = req.params[2];
        req.query.w = req.params[3];
        req.query.h = req.params[4];
        req.query.x = req.params[5];
        req.query.y = req.params[6];
        req.query.format = req.params[7];
        return convertAndDownloadFile(req, res);
    });

    /**
     * @api {get} /pictor/cropresize/{id}/{w}x{h}+{x}+{y}/{nw}x{nh}.{format} download crop image.
     * @apiName downloadCropResizeImage
     * @apiGroup pictor_images
     * @apiDescription convenient alias of `convertAndDownload` api using `cropresize` converter.
     *
     * @apiParam {number} w width in pixels
     * @apiParam {number} h height in pixels
     * @apiParam {number} x distance in pixel from the left edge
     * @apiParam {number} y distance in pixels from the top edge
     * @apiParam {number} [nw] resize width after crop.
     * @apiParam {number} [nh] resize height after crop.
     * @apiParam {string} [format] 'png', 'jpg', 'jpeg' or 'gif'. use source format by default.
     *
     * @apiExample crop foo.jpg to rectangle(400x300+200+100) and resize to 1280x720 of png and download it with curl:
     *    curl -X GET -o output.png http://localhost:3001/pictor/cropresize/foo.jpg/400x300+200+100/1280x720.png
     *
     * @apiSuccessStructure file
     * @apiErrorStructure error
     */
    app.get(new RegExp(prefix + '/cropresize/([\\w\\-\\.]+)/(\\d+)x(\\d+)\\+(\\d+)\\+(\\d+)/(\\d+)x(\\d+)(.(\\w+))?'), function (req, res) {
        req.query.converter = 'cropresize';
        req.query.id = req.params[0];
        req.query.w = req.params[1];
        req.query.h = req.params[2];
        req.query.x = req.params[3];
        req.query.y = req.params[4];
        req.query.nw = req.params[5];
        req.query.nh = req.params[6];
        req.query.format = req.params[7];
        return convertAndDownloadFile(req, res);
    });

    /**
     * @api {get} /pictor/preset/{id}/{preset}.{format} download preset image.
     * @apiName downloadPresetImage
     * @apiGroup pictor_images
     * @apiDescription convenient alias of `convertAndDownload` api using `preset` converter.
     *
     * @apiParam {string} id source file identifier
     * @apiParam {string} preset preset name. 'xxs', 'xs', 's', 'm', 'l', 'xl', 'xxl', 'xxs@2x', 'xs@2x', 's@2x', 'm@2x', 'l@2x', 'xl@2x', 'xxl@2x', ...
     * @apiParam {string} [format] 'png', 'jpg', 'jpeg' or 'gif'. use source format by default.
     *
     * @apiExample preset to xxl@2x(thumbnail to 512x512) of png and download it with curl:
     *    curl -X GET -o output.png http://localhost:3001/pictor/preset/foo.jpg/xxl@2x.png
     *
     * @apiSuccessStructure file
     * @apiErrorStructure error
     */
    app.get(new RegExp(prefix + '/preset/([\\w\\-\\.]+)/([\\w@]+)(.(\\w+))?'), function (req, res) {
        req.query.converter = 'preset';
        req.query.id = req.params[0];
        req.query.preset = req.params[1];
        req.query.format = req.params[3];
        return convertAndDownloadFile(req, res);
    });

    //
    // informal apis
    //

    /**
     * @api {get} /pictor/converters get all available converters.
     * @apiName getConverters
     * @apiGroup pictor_info
     *
     * @apiSuccessStructure result
     * @apiErrorStructure error
     */
    app.get(prefix + '/info/converters', function (req, res) {
        return _sendResult(req, res, pictor.getConverters());
    });

    /**
     * @api {get} /pictor/presets get all available presets.
     * @apiName getPresets
     * @apiGroup pictor_info
     *
     * @apiSuccessStructure result
     * @apiErrorStructure error
     */
    app.get(prefix + '/info/presets', function (req, res) {
        return _sendResult(req, res, pictor.getPresets());
    });

    return app;
}

/**
 * create express (sub) app.
 *
 * @param {object} config
 * @returns {express.application}
 */
function createApp(config) {
    DEBUG && debug('create pictor app...');

    var app = express();

    configureMiddlewares(app, config);

    app.on('mount', function (parent) {
        DEBUG && debug('mount ' + app.path() + ' on ' + parent.path());
        configureRoutes(app, config);
    });

    return app;
}

module.exports = {
    configureMiddlewares: configureMiddlewares,
    configureRoutes: configureRoutes,
    createApp: createApp
};
