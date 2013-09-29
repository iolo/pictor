'use strict';

var
  util = require('util'),
  http = require('http'),
  Q = require('q'),
  _ = require('lodash'),
  express = require('express'),
  pictor = require('../libs/pictor'),
  debug = require('debug')('pictor:routes:api'),
  DEBUG = debug.enabled;

var
  DEF_REDIRECT_STATUS_CODE = false,//or 301,302,307
  redirectStatusCode;

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
 * @apiSuccess {string} [source] source file identifier(variant file only)
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
 * @apiDefineErrorStructure error
 *
 * @apiError {*} error
 * @apiError {number} error.status status code
 * @apiError {string} error.message error message
 * @apiError {number} [error.code] pictor specific error code(only if error.status is 500)
 * @apiError {*} [error.cause] (debug mode only)
 * @apiErrorExample bad request
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
      cause: err
    }
  };

  if (!!req.param('iframe')) {
    return _sendResponseIframe(res, status, error);
  }

  return res.jsonp(status, error);
}

/**
 * send success response.
 *
 * result is one of followings:
 * - 200 ok with file binary(download)
 * - 301,302,307 redirect(download)
 * - 200 ok with json contains id, url, ...
 * - 200 ok with jsonp contains id, url, ...(when request param 'callback' is set)
 * - 200 ok with html contains id, url, ...(when request param 'iframe' is set)
 * - 201 created
 * - 202 accepted
 * - 204 no content
 *
 * @param {*} req
 * @param {*} res
 * @param {PictorFile|array.<PictorFile>|number} result
 * @param {boolean} [download=false] send binary data in various way: redirect, file, stream and proxy.
 * @returns {*}
 * @private
 */
function _sendResult(req, res, result, download) {
  // status without result body: 201, 202, 204
  if (_.isNumber(result)) {
    return res.send(result);
  }

  if (download) {
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
    if (result.disposition) {
      res.set('Content-Disposition', result.disposition);
    }
    if (result.type) {
      res.type(result.type);
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

  DEBUG && debug('*** send result', result);

  if (!_.isObject(result) && !_.isArray(result)) {
    return _sendError(req, res); // internal server error
  }

  if (!!req.param('iframe')) {
    return _sendResponseIframe(res, 200, result);
  }

  return res.jsonp(result);
}

//
//
//

/**
 * @api {post} /pictor/upload upload multiple files
 * @apiName uploadMulti
 * @apiGroup pictor
 * @apiDescription upload multiple files with multipart/upload-data
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
  var fileParam = Array.prototype.concat(req.files.file);
  if (fileParam.length === 0) {
    return _sendError(req, res, {status: 400, message: 'required_param_file'});
  }
  var idParam = Array.prototype.concat(req.param('id'));
  var prefixParam = Array.prototype.concat(req.param('prefix'));
  // FIXME: express ignore paramter order... need to change api spec.

  return Q.all(fileParam.map(function (file, index) {
      return pictor.putFile(file.path, idParam[index], prefixParam[index], file.headers['content-type']);
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
 * @api {post} /pictor/:id upload a file
 * @apiName upload
 * @apiGroup pictor
 * @apiDescription upload a single file with multipart/form-data
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
  var file = req.files.file;
  if (!file) {
    return _sendError(req, res, {status: 400, message: 'required_param_file'});
  }
  if (!file.size) {
    return _sendError(req, res, {status: 400, message: 'invalid_param_file'});
  }

  return pictor.putFile(file.path, req.param('id'), req.param('prefix'), file.headers['content-type'])
    .then(function (result) {
      return _sendResult(req, res, result);
    })
    .fail(function (err) {
      return _sendError(req, res, err);
    })
    .done();
}

/**
 * @api {put} /pictor/:id upload a file with raw data
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
  // req is stream.Readable!
  return pictor.putFile(req, req.param('id'), req.param('prefix'), req.get('content-type'))
    .then(function (result) {
      return _sendResult(req, res, result);
    })
    .fail(function (err) {
      return _sendError(req, res, err);
    })
    .done();
}

/**
 * @api {delete} /pictor/:id delete a file
 * @apiName delete
 * @apiGroup pictor
 * @apiDescription delete the file and its variants.
 *
 * @apiParam {string} id identifier(with extension to guess mime type)
 *
 * @apiSuccessStructure result
 * @apiErrorStructure error
 */
function deleteFile(req, res) {
  var id = req.param('id');

  return pictor.deleteFile(id)
    .then(function () {
      return _sendResult(req, res, 202);
    })
    .fail(function (err) {
      return _sendError(req, res, err);
    })
    .done();
}

/**
 * @api {get} /pictor/:id download a file
 * @apiName download
 * @apiGroup pictor
 * @apiDescription download a file.
 *
 * @apiParam {string} id identifier(with extension to guess mime type)
 *
 * @apiSuccessStructure file
 * @apiErrorStructure error
 */
function downloadFile(req, res) {
  var id = req.param('id');

  return pictor.getFile(id)
    .then(function (result) {
      return _sendResult(req, res, result, true);
    })
    .fail(function (err) {
      return _sendError(req, res, err);
    })
    .done();
}

/**
 * @api {post} /pictor/convert convert a file
 * @apiName convert
 * @apiGroup pictor
 * @apiDescription convert a file
 *
 * @apiParam {string} [preset] 'xs', 's', 'm', 'l', 'xl', 'xxl', ...
 * @apiParam {string} [converter] 'convert', 'resize', 'crop', 'meta', 'exif', ...
 * @apiParam {*} [params] various converter specific params
 *
 * @apiSuccessStructure result
 * @apiErrorStructure error
 */
function convertFiles(req, res) {
  // TODO: more robust parser...
  // TODO: convert multiple files...
  var opts = {
    preset: req.param('preset'),
    converter: req.param('converter'),
    src: req.param('src'),
    nw: req.param('nw'),
    nh: req.param('nh'),
    w: req.param('w'),
    h: req.param('h'),
    flags: req.param('flags'),
    x: req.param('x'),
    y: req.param('y'),
    format: req.param('format')
  };
  return pictor.convertFile(opts)
    .then(function (result) {
      return _sendResult(req, res, result, req.method === 'GET');
    })
    .fail(function (err) {
      return _sendError(req, res, err);
    })
    .done();
}

/**
 * @api {get} /pictor/convert convert a file and download
 * @apiName convertAndDownload
 * @apiGroup pictor
 * @apiDescription convert a single file and download it
 *
 * @apiParam {string} [preset] 'xs', 's', 'm', 'l', 'xl', 'xxl', ...
 * @apiParam {string} [converter] 'convert', 'resize', 'crop', 'meta', 'exif', ...
 * @apiParam {*} [params] various converter specific params
 *
 * @apiSuccessStructure file
 * @apiErrorStructure error
 */
function convertAndDownloadFile(req, res) {
  // req.method === 'GET'
  return convertFiles(req, res);
}

/**
 * @api {get} /pictor/:id/:variant download a variant
 * @apiName downloadVariant
 * @apiGroup pictor
 * @apiDescription download a variant file.
 *
 * @apiParam {string} id source identifier(with extension to guess mime type)
 * @apiParam {string} variant variant identifier with extension
 *
 * @apiSuccessStructure file
 * @apiErrorStructure error
 */
function downloadVariantFile(req, res) {
  var id = req.param('id');
  var variant = req.param('variant');

  return pictor.getFile(id, variant)
    .then(function (result) {
      return _sendResult(req, res, result, true);
    })
    .fail(function (err) {
      return _sendError(req, res, err);
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

  app.post(prefix + '/convert', convertFiles);
  app.get(prefix + '/convert', convertAndDownloadFile);
  app.post(prefix + '/upload', uploadFiles);
  app.put(prefix + '/upload', uploadFileRaw);
  app.get(prefix + '/download', downloadFile);
  app.get(prefix + '/delete', deleteFile);
  app.post(prefix + '/:id', uploadFile);
  app.put(prefix + '/:id', uploadFileRaw);
  app.get(prefix + '/:id', downloadFile);
  app.del(prefix + '/:id', deleteFile);
  app.get(prefix + '/:id/:variant', downloadVariantFile);

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
