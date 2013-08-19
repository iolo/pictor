'use strict';

var
  express = require('express'),
  pictor = require('./pictor'),
  debug = require('debug')('pictor:routes'),
  DEBUG = debug.enabled;

//
//
//

function _sendFileResponse(res, result) {
  console.log('send file response:', result);
  if (result) {
    if (result.type) {
      res.type(result.type);
    }
    if (result.file) {
      return res.sendfile(result.file);
    }
    if (result.url) {
      return res.redirect(result.url);
      //return res.redirect(errors.StatusCode.TEMPORARY_REDIRECT, result.url);
      //return res.redirect(errors.StatusCode.MOVED_PERMANENTLY, result.url);
    }
    //return res.send(result.status, result);
  }
  return res.send(500);
}

/**
 * @api {post} /pictor/:id.:format upload a file.
 * @apiName uploadFile
 * @apiGroup pictor
 *
 * @apiParam {string} id
 * @apiParam {string} format
 * @apiParam {*} file encoded with multipart/upload-data
 *
 * @apiSuccessExample success response:
 *    HTTP/1.1 201 Created
 *
 * @apiError {object} error
 * @apiErrorExample error response:
 *    HTTP/1.1 400 OK
 *    {
 *      error: {
 *        status: 400,
 *        code: 80400,
 *        message: "required_param_file"
 *      }
 *    }
 */
function uploadFile(req, res) {
  // TODO: support both multi-part and raw data

  var file = req.files.file;
  if (!file) {
    return res.send(400, 'required_param_file');
    //throw new errors.BadRequest('required_param_file');
  }

  var id = req.param('id');
  var format = req.param('format');

  // TODO: 마스터/슬레이브에서 원본/변형본 다 삭제!
  return pictor.putFile(id, format, file.path)
    .then(function () {
      return res.send(200, {url: pictor.getUrl(id, format)});
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
 * @api {delete} /pictor/:id.:format delete the file and its variants.
 * @apiName deleteFile
 * @apiGroup pictor
 *
 * @apiParam {string} id
 * @apiParam {string} format
 *
 * @apiSuccessExample success response:
 *    HTTP/1.1 204 No Content
 *
 * @apiSuccessExample error response:
 *    HTTP/1.1 404 Not Found
 */
function deleteFile(req, res) {
  var id = req.param('id');
  var format = req.param('format');

  return pictor.deleteFile(id, format)
    .then(function () {
      return res.send(204);
      //return res.send(errors.StatusCode.NO_CONTENT);
    })
    .fail(function (err) {
      return res.send(500, err);
      //throw new errors.InternalServerError(undefined, err);
    })
    .done();
}

/**
 * @api {get} /pictor/:id.:format download the file.
 * @apiName downloadFile
 * @apiGroup pictor
 *
 * @apiParam {string} id
 * @apiParam {string} format
 *
 * @apiSuccessExample success response:
 *    HTTP/1.1 200 OK
 *    image binary...
 *
 * @apiSuccessExample success response:
 *    HTTP/1.1 301 Moved Permanently
 *    HTTP/1.1 302 Found
 *    HTTP/1.1 307 Temporary Redirect
 *    Location: http://...
 *
 * @apiSuccessExample error response:
 *    HTTP/1.1 404 Not Found
 */
function downloadFile(req, res) {
  var id = req.param('id');
  var format = req.param('format');

  return pictor.getFile(id, format)
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
 * @api {get} /pictor/:id/:geometry.:format download the variant image.
 * @apiName downloadVariantImage
 * @apiGroup pictor
 *
 * @apiParam {string} id
 * @apiParam {string} format
 * @apiParam {string} geometry [WIDTH][xHEIGHT][+LEFT+TOP][PRESET][FLAGS][@2x]
 *
 * @apiSuccessExample success response:
 *    HTTP/1.1 200 OK
 *    image binary...
 *
 * @apiSuccessExample success response:
 *    HTTP/1.1 301 Moved Permanently
 *    HTTP/1.1 302 Found
 *    HTTP/1.1 307 Temporary Redirect
 *    Location: http://...
 *
 * @apiSuccessExample error response:
 *    HTTP/1.1 404 Not Found
 */
function downloadVariantImage(req, res) {
  var id = req.param('id');
  var format = req.param('format');
  var geometry = req.param('geometry');

  return pictor.getVariantImageFile(id, geometry, format)
    .then(function (result) {
      return _sendFileResponse(res, result);
    })
    .fail(function (err) {
      return res.send(404, err);
    })
    .done();
}

/**
 * @api {get} /pictor/:id/meta get image meta data from the file.
 * @apiName downloadImageMeta
 * @apiGroup pictor
 *
 * @apiParam {string} id
 *
 * @apiSuccessExample success response:
 *    HTTP/1.1 200 OK
 *    {
 *      "width": 400,
 *      "height": 300,
 *      "depth": 8,
 *      "colors": 32767,
 *      "format": "JPEG"
 *    }
 *
 * @apiSuccessExample error response:
 *    HTTP/1.1 404 Not Found
 */
function downloadImageMeta(req, res) {
  var id = req.param('id');

  return pictor.getImageMetaFile(id)
    .then(function (result) {
      return _sendFileResponse(res, result);
    })
    .fail(function (err) {
      return res.send(404, err);
    })
    .done();
}

/**
 * @api {get} /pictor/:id/exif get image EXIF data from the file.
 * @apiName downloadImageExif
 * @apiGroup pictor
 *
 * @apiParam {string} id
 *
 * @apiSuccessExample success response:
 *    HTTP/1.1 200 OK
 *    {
 *      "Model": "Good Camera",
 *      ...
 *    }
 *
 * @apiSuccessExample error response:
 *    HTTP/1.1 404 Not Found
 */
function downloadImageExif(req, res) {
  var id = req.param('id');

  return pictor.getImageExifFile(id)
    .then(function (result) {
      return _sendFileResponse(res, result);
    })
    .fail(function (err) {
      return res.send(404, err);
    })
    .done();
}

/**
 * @api {get} /pictor/holder/:geometry.:format download the holder image.
 * @apiName downloadHolderImage
 * @apiGroup pictor
 *
 * @apiParam {string} format
 * @apiParam {string} geometry [WIDTH][xHEIGHT][PRESET][@2x]
 *
 * @apiSuccessExample success response:
 *    HTTP/1.1 200 OK
 *    image binary...
 */
function downloadHolderImage(req, res) {
  var format = req.param('format');
  var geometry = req.param('geometry');

  return pictor.getHolderImageFile(format, geometry)
    .then(function (result) {
      return _sendFileResponse(res, result);
    })
    .fail(function (err) {
      return res.send(500, err);
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
 *    - {boolean} [skipCommonMiddlewares=false]
 *    - {object} [statics] pairs of url prefix and document root.
 *
 * @param {express.application} app
 * @param {object} config
 * @returns {express.application}
 */
function configureMiddlewares(app, config) {
  DEBUG && debug('create pictor middlewares...');

  if (!config.skipCommonMiddlewares) {
    app.use(express.cookieParser());
    app.use(express.bodyParser());
    app.use(express.methodOverride());
  }

  if (config.statics) {
    Object.keys(config.statics).forEach(function (urlPrefix) {
      var docRoot = config.statics[urlPrefix];
      DEBUG && debug('static route: ', urlPrefix, '--->', docRoot);
      app.use(urlPrefix, express.static(docRoot));
    });
  }

  return app;
}

/**
 * configure routes for the express app.
 *
 * @param {express.application} app
 * @param {object} config
 * @returns {express.application}
 */
function configureRoutes(app, config) {
  DEBUG && debug('create pictor routes...');

  // TODO: require auth!
  app.post('/:id.:format', uploadFile);
  app.put('/:id.:format', uploadFile);
  app.del('/:id.:format', deleteFile);
  app.get('/:id.:format', downloadFile);

  app.get('/:id/meta', downloadImageMeta);
  app.get('/:id/exif', downloadImageExif);
  app.get('/:id/.:format', downloadVariantImage);

  app.get('/holder/:geometry.:format', downloadHolderImage);
  app.get('/:id/:geometry.:format', downloadVariantImage);

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
