'use strict';

var
  fs = require('fs'),
  http = require('http'),
  Q = require('q'),
  _ = require('lodash'),
  mime = require('mime'),
  express = require('express'),
  pictor = require('../libs/pictor'),
  ID_NEW = 'new',
  ID_REGEX = /\w+(\.\w+)?/,
  DEF_PREFIX = '',
  debug = require('debug')('pictor:routes:api'),
  DEBUG = debug.enabled;

var
  DEF_REDIRECT_STATUS_CODE = false,//or 301,302,307
  DEF_CONTENT_DISPOSITION = 'inline',//or attachment
  redirectStatusCode,
  contentDisposition;

//
//
//

/**
 *
 * @param {string|stream} file
 * @param {string} [id='new']
 * @param {string} [prefix='']
 * @param {string} [type]
 * @returns {promise} bypass the result of storage.putFile()
 * @private
 */
function _putFile(file, id, prefix, type) {
  if (!id || id === ID_NEW) {
    id = _.uniqueId(prefix || DEF_PREFIX);
    if (type) {
      id += '.' + mime.extension(type);
    }
  } else if (!ID_REGEX.test(id)) {
    throw 'invalid_param_id';
    //throw new errors.BadRequest('invalid_param_id');
  }
  DEBUG && debug('*** upload file:', id, '--->', file);
  return pictor.putFile(id, file);
}

/**
 *
 * @param {*} res
 * @param {*} result
 * @param {string} [result.url]
 * @param {stream} [result.stream]
 * @param {string} [result.file]
 * @param {string} [result.disposition] 'inline', 'attachment'
 * @param {string} [result.type]
 * @returns {*}
 * @private
 */
function _sendFileResponse(res, result) {
  if (!result) {
    return res.send(500);
  }
  if (redirectStatusCode) {
    if (result.url) {
      console.log('*** redirect:', redirectStatusCode, result.url);
      return res.redirect(redirectStatusCode, result.url);
    } else {
      console.log('*** redirect fail! storage does not provide url!');
    }
  }
  if (result.disposition) {
    console.log('*** send disposition:', result.disposition);
    res.set('Content-Disposition', result.disposition);
  }
  if (result.type) {
    console.log('*** send type:', result.type);
    res.type(result.type);
  }
  if (result.stream) {
    console.log('*** send stream');
    return result.stream.pipe(res);
  }
  if (result.file) {
    console.log('*** send file:', result.file);
    return res.sendfile(result.file);
  }
  if (result.url) {
    console.log('*** manual proxy:', result.url);
    return http.get(result.url, function (response) {
      return response.pipe(res);
    });
  }
  return res.send(result.status, result);
}

/**
 * @api {post} /pictor/upload upload multiple files with multipart/upload-data
 * @apiName uploadFiles
 * @apiGroup pictor
 *
 * @apiParam {file|array} file one or more file data as a part of multipart/upload-data
 * @apiParam {string|array} [id='new'] zero or more identifiers for each file(with optional extension to guess mime type)
 * @apiParam {string|array} [prefix=''] zero or more prefixes for each generated identifiers when id is 'new'
 *
 * @apiSuccessExample success response:
 *    HTTP/1.1 200 OK
 *    {
 *      result: [
 *        {id: "foo", url: "http://...",
 *        {id: "bar", url: "http://...",
 *        {id: "baz", url: "http://...",
 *        ...
 *      ]
 *    }
 *
 * @apiErrorExample error response:
 *    HTTP/1.1 400 Bad Request
 *    {
 *      error: {
 *        status: 400,
 *        message: "required_param_files"
 *      }
 *    }
 */
function uploadFiles(req, res) {
  // NOTE: file field name should be 'file'
  var fileParam = Array.prototype.concat(req.files.file);
  if (fileParam.length === 0) {
    return res.send(400, 'required_param_file');
    //throw new errors.BadRequest('required_param_file');
  }
  var idParam = Array.prototype.concat(req.param('id'));
  var prefixParam = Array.prototype.concat(req.param('prefix'));
  // FIXME: express ignore paramter order... need to change api spec.

  return Q.all(fileParam.map(function (file, index) {
      return _putFile(file.path, idParam[index], prefixParam[index], file.headers['content-type']);
    }))
    .then(function (result) {
      return res.send(200, {result: result});
      //return res.send(201);
      //return res.send(errors.StatusCode.CREATED);
    })
    .fail(function (err) {
      return res.send(500, err);
      //throw new errors.InternalServerError(undefined, err);
    })
    .done();
}

/**
 * @api {post} /pictor/:id upload a single file with multipart/form-data
 * @apiName uploadFile
 * @apiGroup pictor
 *
 * @apiParam {file} file file data as a part of multipart/upload-data
 * @apiParam {string} [id='new'] identifier for the file(with optional extension to guess mime type)
 * @apiParam {string} [prefix=''] prefix for generated identifier when id is 'new'
 *
 * @apiSuccessExample success response:
 *    HTTP/1.1 200
 *    {
 *      result: {id: "foo", url: "http://..."}
 *    }
 *
 * @apiErrorExample error response:
 *    HTTP/1.1 400 Bad Request
 *    {
 *      error: {
 *        status: 400,
 *        message: "required_param_file"
 *      }
 *    }
 */
function uploadFile(req, res) {
  // NOTE: file field name should be 'file'
  var file = req.files.file;
  if (!file) {
    return res.send(400, 'required_param_file');
    //throw new errors.BadRequest('required_param_file');
  }
  if (_.isArray(file)) {
    return res.send(400, 'invalid_param_file');
    //throw new errors.BadRequest('invalid_param_file');
  }
  return _putFile(file.path, req.param('id'), req.param('prefix'), file.headers['content-type'])
    .then(function (result) {
      return res.send(200, {result: result});
      //return res.send(201);
      //return res.send(errors.StatusCode.CREATED);
    })
    .fail(function (err) {
      return res.send(500, err);
      //throw new errors.InternalServerError(undefined, err);
    })
    .done();
}

/**
 * @api {put} /pictor/:id upload a single file with raw data.
 * @apiName uploadFile
 * @apiGroup pictor
 *
 * @apiParam {file} file file data as raw binary
 * @apiParam {string} [id='new'] identifier for the file
 * @apiParam {string} [prefix=''] the prefix for generated identifier(used for when id is 'new')
 *
 * @apiSuccessExample success response:
 *    HTTP/1.1 200
 *    {
 *      result: {id: "foo", url: "http://..."}
 *    }
 *
 * @apiErrorExample error response:
 *    HTTP/1.1 400 Bad Request
 *    {
 *      error: {
 *        status: 400,
 *        message: "required_param_file"
 *      }
 *    }
 */
function uploadFileRaw(req, res) {
  // req is stream.Readable!
  return _putFile(req, req.param('id'), req.param('prefix'), req.get('content-type'))
    .then(function (result) {
      return res.send(200, {result: result});
      //return res.send(201);
      //return res.send(errors.StatusCode.CREATED);
    })
    .fail(function (err) {
      return res.send(500, err);
      //throw new errors.InternalServerError(undefined, err);
    })
    .done();
}

/**
 * @api {delete} /pictor/:id delete the file and its variants.
 * @apiName deleteFile
 * @apiGroup pictor
 *
 * @apiParam {string} id identifier(with extension to guess mime type)
 *
 * @apiSuccessExample success response:
 *    HTTP/1.1 202 Accepted
 *
 * @apiSuccessExample error response:
 *    HTTP/1.1 404 Not Found
 */
function deleteFile(req, res) {
  var id = req.param('id');

  return pictor.deleteFile(id)
    .then(function () {
      return res.send(202);
      //return res.send(errors.StatusCode.NO_CONTENT);
    })
    .fail(function (err) {
      return res.send(500, err);
      //throw new errors.InternalServerError(undefined, err);
    })
    .done();
}

/**
 * @api {get} /pictor/:id download the file.
 * @apiName downloadFile
 * @apiGroup pictor
 *
 * @apiParam {string} id identifier(with extension to guess mime type)
 *
 * @apiSuccessExample success response:
 *    HTTP/1.1 200 OK
 *    image binary...
 *
 * @apiSuccessExample success response:
 *    HTTP/1.1 301 Moved Permanently
 *    Location: http://...
 *
 * @apiSuccessExample success response:
 *    HTTP/1.1 302 Found
 *    Location: http://...
 *
 * @apiSuccessExample success response:
 *    HTTP/1.1 307 Temporary Redirect
 *    Location: http://...
 *
 * @apiSuccessExample error response:
 *    HTTP/1.1 404 Not Found
 */
function downloadFile(req, res) {
  var id = req.param('id');

  return pictor.getFile(id)
    .then(function (result) {
      return _sendFileResponse(res, result);
    })
    .fail(function (err) {
      return res.send(404, err);
      //throw new errors.NotFound(undefined, err);
    })
    .done();
}

/**
 * @api {post} /pictor/convert convert one or more files
 * @apiName convertFile
 * @apiGroup pictor
 *
 * @apiParam {string} converter 'convert', 'resize', 'crop', 'meta', 'exif', ...
 *
 * @apiSuccessExample success response:
 *    HTTP/1.1 200 OK
 *    {
 *      result: [
 *        {id: "foo", url: "http://...",
 *        {id: "bar", url: "http://...",
 *        {id: "baz", url: "http://...",
 *        ...
 *      ]
 *    }
 *
 * @apiSuccessExample error response:
 *    HTTP/1.1 404 Not Found
 */
function convertFiles(req, res) {
  // TODO: more robust parser...
  // TODO: convert multiple files...
  var opts = {
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
      if (req.method === 'GET') {
        return _sendFileResponse(res, result);
      }
      return res.send(result);
    })
    .fail(function (err) {
      return res.send(404, err);
    })
    .done();
}

/**
 * @api {get} /pictor/convert convert a single file and download it
 * @apiName convertAndDownloadFile
 * @apiGroup pictor
 *
 * @apiParam {string} converter 'convert', 'resize', 'crop', 'meta', 'exif', ...
 *
 * @apiSuccessExample success response:
 *    HTTP/1.1 200 OK
 *    image binary...
 *
 * @apiSuccessExample success response:
 *    HTTP/1.1 301 Moved Permanently
 *    Location: http://...
 *
 * @apiSuccessExample success response:
 *    HTTP/1.1 302 Found
 *    Location: http://...
 *
 * @apiSuccessExample success response:
 *    HTTP/1.1 307 Temporary Redirect
 *    Location: http://...
 *
 * @apiSuccessExample error response:
 *    HTTP/1.1 404 Not Found
 */
function convertAndDownloadFile(req, res) {
  // req.method === 'GET'
  return convertFiles(req, res);
}

/**
 * @api {get} /pictor/:id/:variant download a variant file.
 * @apiName downloadVariantFile
 * @apiGroup pictor
 *
 * @apiParam {string} id source identifier(with extension to guess mime type)
 * @apiParam {string} variant variant identifier with extension
 *
 * @apiSuccessExample success response:
 *    HTTP/1.1 200 OK
 *    image binary...
 *
 * @apiSuccessExample success response:
 *    HTTP/1.1 301 Moved Permanently
 *    Location: http://...
 *
 * @apiSuccessExample success response:
 *    HTTP/1.1 302 Found
 *    Location: http://...
 *
 * @apiSuccessExample success response:
 *    HTTP/1.1 307 Temporary Redirect
 *    Location: http://...
 *
 * @apiSuccessExample error response:
 *    HTTP/1.1 404 Not Found
 */
function downloadVariantFile(req, res) {
  var id = req.param('id');
  var variant = req.param('variant');
  return pictor.getVariantFile(id, variant)
    .then(function (result) {
      return _sendFileResponse(res, result);
    })
    .fail(function (err) {
      return res.send(404, err);
      //throw new errors.NotFound(undefined, err);
    })
    .done();
}

//
//
//

/**
 *  configure middlewares for the express app.
 *
 * `config` contains:
 *    - {boolean|number} [redirectStatusCode=false]: 301, 302 or 307 to use redirect.
 *    - {object} [statics] pairs of url prefix and document root.
 *
 * @param {express.application} app
 * @param {*} config
 * @param {boolean|number} [config.redirect=false] false,301,302,307
 * @param {string} [config.contentDisposition='inline'] 'inline', 'attachment'
 * @returns {express.application}
 */
function configureMiddlewares(app, config) {
  DEBUG && debug('create pictor middlewares...', config);

  redirectStatusCode = config.redirect || DEF_REDIRECT_STATUS_CODE;
  contentDisposition = config.contentDisposition || DEF_CONTENT_DISPOSITION;

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
