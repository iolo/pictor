'use strict';

var
  fs = require('fs'),
  http = require('http'),
  Q = require('q'),
  _ = require('lodash'),
  express = require('express'),
  pictor = require('./pictor'),
  debug = require('debug')('pictor:routes'),
  DEBUG = debug.enabled;

var
  DEF_REDIRECT_STATUS_CODE = false,//or 301,302,307
  redirectStatusCode;

//
//
//

function _validateId(id, prefix) {
  var matches = /([\w]+)(\.[\w]+)?/.exec(id);
  if (!matches) {
    throw 'invalid_param_id';
    //throw new errors.BadRequest('invalid_param_id');
  }
  if (matches[1] === 'new') {
    id = _.uniqueId(prefix || 'pictor_');
    if (matches[2]) {
      id += matches[2]; // .ext
    }
  }
  return id;
}

function _sendFileResponse(res, result) {
  if (!result) {
    return res.send(500);
  }
  if (result.type) {
    console.log('*** send type:', result.type);
    res.type(result.type);
  }
  if (redirectStatusCode) {
    if (result.url) {
      console.log('*** redirect:', redirectStatusCode, result.url);
      return res.redirect(redirectStatusCode, result.url);
    } else {
      console.log('*** redirect fail! storage does not provide url!');
    }
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
 * @api {post} /pictor/upload upload multiple files with http multipart post
 * @apiName uploadFiles
 * @apiGroup pictor
 *
 * @apiParam {array} files encoded with multipart/upload-data. param names are `id` for each file.
 * @apiParam {string} [idprefix] used to generate new id if basename of `id` is 'new'
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
  if (!req.files) {
    return res.send(400, 'required_param_files');
    //throw new errors.BadRequest('required_param_file');
  }

  var putFilePromises = Object.keys(req.files).map(function (fileParamName) {
    console.log('***file:', fileParamName, req.files[fileParamName]);
    var id = _validateId(fileParamName, req.param('idprefix'));
    var file = req.files[fileParamName];
    return pictor.putFile(id, file.path);
  });

  return Q.all(putFilePromises)
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
 * @api {post} /pictor/:id upload a file.
 * @apiName uploadFile
 * @apiGroup pictor
 *
 * @apiParam {string} id identifier with extension to guess mimetype
 * @apiParam {string} [idprefix] used to generate new id if basename of `id` is 'new'
 * @apiParam {*} file encoded with multipart/upload-data
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
  var file = req.files.file;
  if (!file) {
    return res.send(400, 'required_param_file');
    //throw new errors.BadRequest('required_param_file');
  }

  var id = _validateId(req.param('id'), req.param('idprefix'));

  return pictor.putFile(id, file.path)
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
 * @api {put} /pictor/:id upload a file with raw data.
 * @apiName uploadFile
 * @apiGroup pictor
 *
 * @apiParam {string} id identifier with extension to guess mimetype
 * @apiParam {string} [idprefix] used to generate new id if basename of `id` is 'new'
 * @apiParam {*} file binary data
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
  var id = _validateId(req.param('id'), req.param('idprefix'));

  var tempFilePath = '/tmp/' + id;

  fs.createWriteStream(tempFilePath).pipe(req)
    .on('error', function (err) {
      return res.send(500, err);
    })
    .on('end', function () {
      return pictor.putFile(id, tempFilePath)
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
    });
}

/**
 * @api {delete} /pictor/:id delete the file and its variants.
 * @apiName deleteFile
 * @apiGroup pictor
 *
 * @apiParam {string} id identifier with extension to guess mimetype
 *
 * @apiSuccessExample success response:
 *    HTTP/1.1 204 No Content
 *
 * @apiSuccessExample error response:
 *    HTTP/1.1 404 Not Found
 */
function deleteFile(req, res) {
  var id = req.param('id');

  return pictor.deleteFile(id)
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
 * @api {get} /pictor/:id download the file.
 * @apiName downloadFile
 * @apiGroup pictor
 *
 * @apiParam {string} id
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
 * @api {get} /pictor/:id/converted.:format get converted image for the file.
 * @apiName downloadConvertedImage
 * @apiGroup pictor
 *
 * @apiParam {string} id
 * @apiParam {string} format
 *
 * @apiSuccessExample success response:
 *    HTTP/1.1 200 OK
 *    binary data...
 *
 * @apiSuccessExample error response:
 *    HTTP/1.1 404 Not Found
 */
function downloadConvertedImage(req, res) {
  var id = req.param('id');
  var format = req.param('format');

  return pictor.getConvertedImageFile(id, format)
    .then(function (result) {
      return _sendFileResponse(res, result);
    })
    .fail(function (err) {
      return res.send(404, err);
    })
    .done();
}

/**
 * @api {get} /pictor/:id/optimized.:format get optimized image for the file.
 * @apiName downloadOptimzedImage
 * @apiGroup pictor
 *
 * @apiParam {string} id
 * @apiParam {string} format
 *
 * @apiSuccessExample success response:
 *    HTTP/1.1 200 OK
 *    binary data...
 *
 * @apiSuccessExample error response:
 *    HTTP/1.1 404 Not Found
 */
function downloadOptimizedImage(req, res) {
  var id = req.param('id');
  var format = req.param('format');

  return pictor.getOptimizedImageFile(id, format)
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
  var geometry = req.param('geometry');
  var format = req.param('format');

  var g = pictor.parseGeometry(geometry);

  return pictor.getHolderImageFile(g.w, g.h, format)
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
 *    - {boolean|number} [redirectStatusCode=false]: 301, 302 or 307 to use redirect.
 *    - {boolean} [skipCommonMiddlewares=false]
 *    - {object} [statics] pairs of url prefix and document root.
 *
 * @param {express.application} app
 * @param {object} config
 * @returns {express.application}
 */
function configureMiddlewares(app, config) {
  DEBUG && debug('create pictor middlewares...');

  redirectStatusCode = config.redirectStatusCode || DEF_REDIRECT_STATUS_CODE;

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
 * @param {*} app
 * @param {object} config
 * @returns {express.application}
 */
function configureRoutes(app, config) {
  DEBUG && debug('create pictor routes...');

  var prefix = config.prefix || '';

  // TODO: require auth!
  app.post(prefix + '/upload', uploadFiles);
  app.post(prefix + '/:id', uploadFile);
  app.put(prefix + '/:id', uploadFileRaw);
  app.del(prefix + '/:id', deleteFile);
  app.get(prefix + '/:id', downloadFile);

  // routes for image files...
  // TODO: more pretty and graceful urls...
  app.get(prefix + '/holder/:geometry.:format', downloadHolderImage);
  app.get(prefix + '/:id/meta.json', downloadImageMeta);
  app.get(prefix + '/:id/exif.json', downloadImageExif);
  app.get(prefix + '/:id/:geometry.:format', downloadVariantImage);
  app.get(prefix + '/:id/converted.:format', downloadConvertedImage);
  app.get(prefix + '/:id/optimized.:format', downloadOptimizedImage);
  //app.get(prefix + '/:id/resize_[\d+]x[\d+].:format', downloadResizedImage);
  //app.get(prefix + '/:id/resize_[\d+]x[\d+]\+[\d+]\+[\d+].:format', downloadCroppedImage);
  //app.get(prefix + '/:id/thumbnail_[\d+]x[\d+].:format', downloadThumbnailImage);

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
