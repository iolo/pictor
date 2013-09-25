'use strict';

var
  fs = require('fs'),
  http = require('http'),
  Q = require('q'),
  _ = require('lodash'),
  mime = require('mime'),
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

function _getIdParam(id, prefix, type) {
  if (!id) {
    throw 'invalid_param_id';
  }
  // id is 'new' -> generate new unique id
  if (id === 'new') {
    id = _.uniqueId(prefix || 'pictor_');
  }
  // id without extension -> guess extension from request content type
  if (type && id.indexOf('.') === -1) {
    id += '.' + mime.extension(type);
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
 * @api {post} /pictor/upload upload multiple files with http multipart/upload-data post
 * @apiName uploadFiles
 * @apiGroup pictor
 *
 * @apiParam {string} [idprefix] used to generate new id if basename of `id` is 'new'
 * @apiParam {array} files encoded with multipart/upload-data. param name wll be used as `id` for the file.
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
    var file = req.files[fileParamName];
    var id = _getIdParam(fileParamName, req.param('idprefix'), file.type);
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

  var id = _getIdParam(req.param('id'), req.param('idprefix'), file.type);

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
 * @apiParam {string} id identifier(with extension to guess mimetype)
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
  var id = _getIdParam(req.param('id'), req.param('idprefix'), req.get('content-type'));

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
 * @apiParam {string} id identifier(with extension to guess mimetype)
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
 * @apiParam {string} id identifier(with extension to guess mimetype)
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
 * @api {get} /pictor/convert convert one or more files
 * @apiName convertFile
 * @apiGroup pictor
 *
 * @apiParam {string} converter 'convert', 'resize', 'crop', 'meta', 'exif', ...
 *
 * @apiSuccessExample success response:
 *    HTTP/1.1 200 OK
 *    { url: "http://..." }
 *
 * @apiSuccessExample error response:
 *    HTTP/1.1 404 Not Found
 */
function convertFile(req, res) {
  // TODO: more robust parser...
  var opts = {
    converter: req.param('converter'),
    src: req.param('src'),
    w: req.param('w'),
    h: req.param('h'),
    flags: req.param('flags'),
    x: req.param('x'),
    y: req.param('y'),
    format: req.param('format')
  };
  return pictor.convertFile(opts)
    .then(function (result) {
      return res.send(result);
      //return _sendFileResponse(res, result);
    })
    .fail(function (err) {
      return res.send(404, err);
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
 * @param {object} config
 * @returns {express.application}
 */
function configureMiddlewares(app, config) {
  DEBUG && debug('create pictor middlewares...');

  redirectStatusCode = config.redirectStatusCode || DEF_REDIRECT_STATUS_CODE;

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

  var bodyParser = express.bodyParser();

  // TODO: require auth!
  app.get(prefix + '/convert', convertFile);
  app.post(prefix + '/upload', bodyParser, uploadFiles);
  app.post(prefix + '/:id', bodyParser, uploadFile);
  app.put(prefix + '/:id', uploadFileRaw);
  app.del(prefix + '/:id', deleteFile);
  app.get(prefix + '/:id', downloadFile);

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
