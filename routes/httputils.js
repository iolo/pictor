'use strict';

/**
 * @module opentrophy.routes.common
 */

var
  util = require('util'),
  path = require('path'),
  _ = require('lodash'),
  Q = require('q'),
  express = require('express'),
  errors = require('./errors'),
  debug = require('debug')('pictor:routes:httputils'),
  DEBUG = debug.enabled;

/**
 * collect query params from (express) request into object
 *
 * @param {express.request} req
 * @param {Array.<string>} paramNames
 * @returns {{query:{}, fields:{}, options:{}, params:{}}
 */
function collectQueryParams(req, paramNames) {
  var result = {
    query: {},
    fields: {},
    options: {},
    params: {}
  };
  paramNames.forEach(function (paramName) {
    var paramValue = req.param(paramName);
    if (paramValue) {
      paramValue = paramValue.trim();
      if (paramValue && paramValue !== '*') {
        if (paramValue.charAt(paramValue.length - 1) === '*') {
          // regexp to match prefix
          paramValue = new RegExp('^' + paramValue.substring(0, paramValue.length - 1));
        }
        result.query[paramName] = paramValue;
      }
      result.params[paramName] = paramValue;
    }
  });
  var fields = req.param('fields');
  if (fields) {
    result.fields = {};
    fields.split(',').forEach(function (field) {
      field = field.trim();
      if (field) {
        var select = 1;
        switch (field.charAt(0)) {
          case '-':
            field = field.substring(1);
            select = 0;
            break;
          case '+':
            field = field.substring(1);
            break;
        }
        result.fields[field] = select;
      }
    });
  }
  var sort = req.param('sort');
  if (sort) {
    result.options.sort = {};
    sort.split(',').forEach(function (field) {
      field = field.trim();
      if (field) {
        var order = 1;
        switch (field.charAt(0)) {
          case '-':
            field = field.substring(1);
            order = -1;
            break;
          case '+':
            field = field.substring(1);
            break;
        }
        result.options.sort[field] = order;
      }
    });
    result.params.sort = sort;
  }
  var skip = req.param('skip') || req.param('offset');
  if (skip) {
    result.options.skip = parseInt(skip, 10);
    result.params.skip = skip;
  }
  var limit = req.param('limit');
  if (limit) {
    result.options.limit = parseInt(limit, 10);
    result.params.limit = limit;
  }
  return result;
}

function collectDeviceParams(req) {
  return _.defaults(req.param('device') || {}, {uuid: req.ip, model: req.headers['user-agent']});
}

// TODO: ...
function generateCaptcha(res) {
}

// TODO: ...
function validateCaptcha(req) {
  // throw new ParamNotMatch('captcha');
}

/**
 *
 * @param {int} offset - index of the first item of current page(aka. skip)
 * @param {int} limit - number of items in a page(aka. page size)
 * @param {int} count - total number of items
 * @param {int} [range=5] computation range before/after the current page
 * @returns {Array.<{page:int,skip:int,limit:int,active:boolean}>} pagination infos with computed offset
 */
function pagination(offset, limit, count, range) {
  var pages = [];
  var currentPage = Math.floor(offset / limit);
  var firstPage = Math.max(currentPage - (range || 5), 0);
  var lastPage = Math.min(currentPage + (range || 5), Math.floor(count / limit));
  for (var page = firstPage; page <= lastPage; page += 1) {
    pages.push({page: page, skip: page * limit, limit: limit, active: (page === currentPage)});
  }
  return pages;
}

/**
 *
 * @param {*} req
 * @param {*} res
 * @param {string} [view]
 * @param {string} [next]
 * @param {*} [vm] view model
 * @returns {*}
 */
function renderViewOrRedirectToNext(req, res, view, next, vm) {
  next = req.param('next') || next;
  if (view) {
    return res.render(view, _.extend({next: next}, vm));
  }
  return res.redirect(next);
}

//
// connect/express extensions/middlewares
//

/**
 * add some utility methods to http request.
 */
function extendHttpRequest() {
  var req = require('http').IncomingMessage.prototype;

  /**
   * get string param from http request.
   *
   * @param {string} paramName
   * @param {string} [fallback]
   * @returns {String} param value
   * @throws {*} no param acquired and no fallback provided
   */
  req.strParam = function (paramName, fallback) {
    var paramValue = this.param(paramName);
    if (paramValue !== undefined) {
      return paramValue;
    }
    if (fallback !== undefined) {
      return fallback;
    }
    throw new errors.BadRequest('param_required:' + paramName);
  };

  /**
   * get integer param from http request.
   *
   * @param {string} paramName
   * @param {number} [fallback]
   * @returns {number} param value
   * @throws {ParamRequired} no param acquired and no fallback provided
   */
  req.intParam = function (paramName, fallback) {
    var paramValue = parseInt(this.param(paramName), 10);
    if (!isNaN(paramValue)) {
      return paramValue;
    }
    if (fallback !== undefined) {
      return fallback;
    }
    throw new errors.BadRequest('int_param_required:' + paramName);
  };

  /**
   * get number(float) param from http request.
   *
   * @param {string} paramName
   * @param {number} [fallback]
   * @returns {number} param value
   * @throws {ParamRequired} no param acquired and no fallback provided
   */
  req.numberParam = function (paramName, fallback) {
    var paramValue = parseFloat(this.param(paramName));
    if (isNaN(paramValue)) {
      return paramValue;
    }
    if (fallback !== undefined) {
      return fallback;
    }
    throw new errors.BadRequest('number_param_required:' + paramName);
  };

  /**
   * get bool param from http request.
   *
   * @param {string} paramName
   * @returns {boolean} [fallback]
   * @returns {boolean} param value
   * @throws {ParamRequired} no param acquired and no fallback provided
   */
  req.boolParam = function (paramName, fallback) {
    var paramValue = String(this.param(paramName)).toLowerCase();
    if (/^(1|y|yes|on|t|true)$/.test(paramValue)) {
      return true;
    }
    if (/^(0|n|no|off|f|false)$/.test(paramValue)) {
      return false;
    }
    if (fallback !== undefined) {
      return fallback;
    }
    throw new errors.BadRequest('bool_param_required:' + paramName);
  };

  /**
   * collect params from http request.
   *
   * @param {Array.<string>} paramNames
   * @returns {Object.<string,string>}
   */
  req.collectParams = function (paramNames) {
    var self = this;
    return paramNames.reduce(function (params, paramName) {
      var paramValue = self.param(paramName);
      if (paramValue) {
        params[paramName] = paramValue.trim();
      }
      return params;
    }, {});
  };
}

/**
 * CORS middleware.
 *
 * @param {*} options
 * @param {string} [options.origin='*']
 * @param {string} [options.methods]
 * @param {string} [options.headers]
 * @param {string} [options.credentials=false]
 * @param {string} [options.maxAge=24*60*60]
 * @returns {function} connect/express middleware function
 * @see https://developer.mozilla.org/en-US/docs/HTTP/Access_control_CORS
 */
function cors(options) {
  options = _.merge(options || {}, {
    origin: '*',
    methods: 'GET,PUT,POST,DELETE',
    headers: 'Accept,Authorization,Content-Type,Origin,Referer,User-Agent,X-Requested-With',
    credentials: false,
    maxAge: 24 * 60 * 60
  });
  DEBUG && debug('configure http cors middleware', options);
  return function (req, res, next) {
    if (req.headers.origin) {
      res.header('Access-Control-Allow-Origin', options.origin === '*' ? req.headers.origin : options.origin);
      res.header('Access-Control-Allow-Methods', options.methods);
      res.header('Access-Control-Allow-Headers', options.headers);
      res.header('Access-Control-Allow-Credentials', options.credentials);
      res.header('Access-Control-Max-Age', options.maxAge);
      if ('OPTIONS' === req.method) {
        // CORS pre-flight request -> no content
        return res.send(errors.StatusCode.NO_CONTENT);
      }
    }
    return next();
  };
}

/**
 * logger middleware.
 *
 * @param {*} options
 * @param {*} [options.stream]
 * @param {string} [options.stream.file]
 * @returns {function} connect/express middleware function
 */

function logger(options) {
  options = options || {};
  DEBUG && debug('configure http logger middleware', options);
  if (options.stream) {
    try {
      var loggerFile = path.resolve(process.cwd(), options.stream.file || options.stream);
      // replace stream options with stream object
      options.stream = require('fs').createWriteStream(loggerFile, {flags: 'a'});
      return express.logger(options);
    } catch (e) {
      console.error('failed to configure http logger stream', e);
      //process.exit(1);
    }
  }
  console.warn('**fallback** use default logger middleware');
  return express.logger(options);
}

/**
 * session middleware.
 *
 * @param {*} options
 * @param {*} [options.store]
 * @param {string} [options.store.module]
 * @param {*} [options.store.options] store specific options
 * @returns {function} connect/express middleware function
 */
function session(options) {
  options = options || {};
  DEBUG && debug('configure http session middleware', options);
  if (options.store) {
    try {
      var storeModule = options.store.module;
      var SessionStore = require(storeModule)(express);
      // replace store options with store object
      options.store = new SessionStore(options.store.options);
      return express.session(options);
    } catch (e) {
      console.error('failed to configure http session store', e);
      //process.exit(1);
    }
  }
  console.warn('**fallback** use default session middleware');
  if (!options.secret) { options.secret = 'nosecret'; }
  return express.session(options);
}

function configureMiddlewares(app, config) {

  extendHttpRequest();

  // NOTE: this should be the first middleware
  app.use(logger(config.logger));

  app.use(express.cookieParser());
  app.use(express.bodyParser({keepExtensions:true}));//uploadDir:config.uploadDir,limit:100mb
  //app.use(express.methodOverride());

  // allow cors request
  app.use(cors(config.cors));

  // NOTE: this should be prior to passport middlewares
  app.use(session(config.session));

  if (config.root) {
    var root = path.resolve(process.cwd(), config.root);
    DEBUG && debug('configure http static root:', root);
    app.use(express.favicon(path.join(root, 'favicon.ico')));
    app.use(express.static(root));
  }

  if (config.statics) {
    Object.keys(config.statics).forEach(function (urlPrefix) {
      var docRoot = path.resolve(process.cwd(), config.statics[urlPrefix]);
      DEBUG && debug('configure http static route: ', urlPrefix, '--->', docRoot);
      app.use(urlPrefix, express.static(docRoot));
    });
  }

}

//
//
//

/**
 * express 404 error handler.
 *
 * @param {*} options
 * @param {string} [options.view='errors/404']
 * @returns {function} express request handler
 */
function error404(options) {
  options = options || {};
  var htmlView = options.view || 'errors/404';

  return function (req, res, next) {
    res.status(404);

    switch (req.accepts('html,json')) {
      case 'html':
        return res.render(htmlView);
      case 'json':
        return res.json({ error: 'Not Found'});
    }
    return res.send('Not Found');
  };
}

/**
 * express uncaught error handler.
 *
 * @param {*} options
 * @param {string} [options.view='errors/500']
 * @param {boolean} [options.stack=false]
 * @returns {function} express error handler
 */
function error500(options) {
  options = options || {};
  var htmlView = options.view || 'errors/500';

  return function (err, req, res, next) {
    console.error('uncaught express error:', err);

    var error = {
      status: err.status || 500,
      code: err.code || 0,
      message: err.message || String(err)
    };
    if (options.stack) {
      error.stack = (err.stack && err.stack.split('\n')) || [];
    }

    res.status(error.status);

    switch (req.accepts('html,json')) {
      case 'html':
        return res.render(htmlView, {error: error});
      case 'json':
        return res.json(error);
    }
    return res.send(util.inspect(error));
  };
}

function configureRoutes(app, config) {
  DEBUG && debug('configure error routes', config.errors);
  if (config.errors) {
    var config404 = config.errors['404'];
    if (config404) {
      app.use(error404(config404));
    }
    var config500 = config.errors['500'];
    if (config500) {
      app.use(error500(config500));
    }
  } else {
    console.warn('**fallback** use default error route');
    app.use(express.errorHandler({dumpException: true, showStack: true}));
  }
}

module.exports = {
  collectQueryParams: collectQueryParams,
  collectDeviceParams: collectDeviceParams,
  generateCaptcha: generateCaptcha,
  validateCaptcha: validateCaptcha,
  pagination: pagination,
  renderViewOrRedirectToNext: renderViewOrRedirectToNext,
  extendHttpRequest: extendHttpRequest,
  // middlewares
  cors: cors,
  logger: logger,
  session: session,
  configureMiddlewares: configureMiddlewares,
  // error routes
  error404: error404,
  error500: error500,
  configureRoutes: configureRoutes
};
