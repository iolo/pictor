'use strict';

var
  util = require('util'),
  path = require('path'),
  _ = require('lodash'),
  Q = require('q'),
  express = require('express'),
  errors = require('./errors'),
  debug = require('debug')('toybox:common'),
  DEBUG = debug.enabled;

//
// custom http errors
//

/**
 * alias of 401 {@link Unauthorized}.
 *
 * @param {String} [message]
 * @param {*} [cause]
 * @constructor
 */
function InvalidSession(message, cause) {
  InvalidSession.super_.call(this, message || 'Invalid Session', cause);
}
util.inherits(InvalidSession, errors.Unauthorized);
InvalidSession.prototype.name = 'InvalidSession';

/**
 * alias of 403 {@link Forbidden}.
 *
 * @param {String} [message]
 * @param {*} [cause]
 * @constructor
 */
function AccessDenied(message, cause) {
  AccessDenied.super_.call(this, message || 'Access Denied', cause);
}
util.inherits(AccessDenied, errors.Forbidden);
AccessDenied.prototype.name = 'AccessDenied';

/**
 *
 * @param {string} paramName
 * @constructor
 */
function ParamRequired(paramName) {
  ParamRequired.super_.call(this, 'param_required:' + paramName);
}
util.inherits(ParamRequired, errors.BadRequest);
ParamRequired.prototype.name = 'ParamRequired';

/**
 *
 * @param {string} paramName
 * @constructor
 */
function IntParamRequired(paramName) {
  IntParamRequired.super_.call(this, 'int_param_required:' + paramName);
}
util.inherits(IntParamRequired, errors.BadRequest);
IntParamRequired.prototype.name = 'IntParamRequired';

/**
 *
 * @param {string} paramName
 * @constructor
 */
function ParamNotMatch(paramName) {
  ParamNotMatch.super_.call(this, 'param_not_match: ' + paramName);
}
util.inherits(ParamNotMatch, errors.BadRequest);
ParamNotMatch.prototype.name = 'ParamNotMatch';

//
//
//

/**
 *
 * @param {express.request} req
 * @param {string} paramName
 * @returns {String} param value
 * @throws {ParamRequired}
 */
function requiredParam(req, paramName) {
  var paramValue = req.param(paramName);
  if (!paramValue) {
    throw new ParamRequired(paramName);
  }
  return paramValue;
}

/**
 *
 * @param {express.request} req
 * @param {string} paramName
 * @returns {Number} param value
 * @throws {IntParamRequired}
 */
function intParam(req, paramName) {
  var paramValue = parseInt(req.param(paramName), 10);
  if (isNaN(paramValue)) {
    throw new IntParamRequired(paramName);
  }
  return paramValue;
}

/**
 * collect params from (express) request into object
 *
 * @param {express.request} req
 * @param {Array.<string>} paramNames
 * @returns {Object.<string,string>}
 */
function collectParams(req, paramNames) {
  return paramNames.reduce(function (result, paramName) {
    var paramValue = req.param(paramName);
    if (paramValue) {
      result[paramName] = paramValue.trim();
    }
    return result;
  }, {});
}

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
 * @param {express.request} req
 * @param {express.response} res
 * @param {string} view
 * @param {string} next
 * @param {object} [vm] view model
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
//
//

/**
 * @callback paramMapperFuncCallback
 * @param {string} paramValue
 * @param {express.request} req
 * @param {express.response} res
 * @return {promise} promise of get mapped object from param value
 */

/**
 * create express param middlware function that
 * maps param to object and save it into (express response) "locals".
 *
 * @param {string} paramName - param name
 * @param {Function} mapper
 * @param {Array.<string>} [localNames] - required local names
 * @returns {Function} express param middleware
 */
function paramMapperFunc(paramName, mapper, localNames) {
  return  function (req, res, next) {
    if (localNames) {
      for (var i = 0, len = localNames.length; i < len; i += 1) {
        var localName = localNames[i];
        if (!res.locals[localName]) {
          return next(new ParamRequired(localName));
        }
      }
    }
    var paramValue = req.param(paramName);
    if (!paramValue) {
      return next(new ParamRequired(paramName));
    }
    return mapper(paramValue, req, res)
      .then(function (result) {
        res.locals[paramName] = result;
        return next();
      })
      .fail(function (err) {
        DEBUG && debug('map "' + paramName + '" param fail', err);
        return next(new ParamNotMatch(paramName));
      })
      .done();
  };
}

//
//
//

function cors(options) {
  options = options || {};
  var origin = options.origin || '*';
  var methods = options.methods || 'GET,PUT,POST,DELETE';
  var headers = options.headers || 'Accept,Authorization,Content-Type,Origin,Referer,User-Agent,X-Requested-With';
  var credentials = true;
  return function (req, res, next) {
    if (origin === '*' && req.headers.origin) {
      res.header('Access-Control-Allow-Origin', req.headers.origin);
    } else {
      res.header('Access-Control-Allow-Origin', origin);
    }
    res.header('Access-Control-Allow-Methods', methods);
    res.header('Access-Control-Allow-Headers', headers);
    res.header('Access-Control-Allow-Credentials', credentials);
    if ('OPTIONS' === req.method) {
      // CORS pre-flight request -> no content
      return res.send(errors.StatusCode.NO_CONTENT);
    }
    return next();
  };
}

function logger(options) {
  options = options || {};
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

function session(options) {
  options = options || {};
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
  return express.session(options);
}

function configureMiddlewares(app, config) {
  // this should be the first middleware
  app.use(logger(config.logger));

  app.use(express.cookieParser());
  app.use(express.bodyParser());
  app.use(express.methodOverride());

  // allow cors request
  app.use(cors(config.cors));

  // this should be prior to passport middlewares
  app.use(session(config.session));

  if (config.root) {
    var root = path.resolve(process.cwd(), config.root);
    DEBUG && debug('static web root:', root);
    app.use(express.favicon(path.join(root, 'favicon.ico')));
    app.use(express.static(root));
  }
}

//
//
//

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

function error500(options) {
  options = options || {};
  var htmlView = options.view || 'errors/500';

  return function (err, req, res, next) {
    console.error('uncaught express error:', err);

    var status = err.status || 500;
    var error = {
      code: err.code || 0,
      message: err.message || err,
      stack: (err.stack && err.stack.split('\n')) || []
    };

    res.status(status);

    switch (req.accepts('html,json')) {
      case 'html':
        return res.render(htmlView, {error: util.inspect(error)});
      case 'json':
        return res.json(error);
    }
    return res.send(util.inspect(error));
  };
}

function configureRoutes(app, config) {
  app.use(error404(config.errors && config.errors['404']));
  app.use(error500(config.errors && config.errors['500']));
  //app.use(express.errorHandler({dumpException:true, showStack:true}));
}

module.exports = {
  InvalidSession: InvalidSession,
  AccessDenied: AccessDenied,
  ParamRequired: ParamRequired,
  IntParamRequired: IntParamRequired,
  ParamNotMatch: ParamNotMatch,
  requiredParam: requiredParam,
  intParam: intParam,
  collectParams: collectParams,
  collectQueryParams: collectQueryParams,
  generateCaptcha: generateCaptcha,
  validateCaptcha: validateCaptcha,
  pagination: pagination,
  renderViewOrRedirectToNext: renderViewOrRedirectToNext,
  paramMapperFunc: paramMapperFunc,
  //
  cors: cors,
  logger: logger,
  session: session,
  configureMiddlewares: configureMiddlewares,
  //
  error404: error404,
  error500: error500,
  configureRoutes: configureRoutes
};
