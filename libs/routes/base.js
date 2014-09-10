'use strict';

/** @module pictor.http.base */

var
    http = require('http'),
    Q = require('q'),
    _ = require('lodash'),
    pictor = require('../pictor'),
    debug = require('debug')('pictor:http:base'),
    DEBUG = debug.enabled;


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
 * send result with 'textearea' tag and send as 'text/html'.
 *
 * @param {*} res
 * @param {number} status
 * @param {*} result
 * @returns {*}
 * @private
 */
function sendResultIframe(res, status, result) {
    res.type('html');
    return res.send('<textarea data-type="application/json" data-status="' + status + '">' + JSON.stringify(result) + '</textarea>');
}

/**
 * send file binary or redirect if fallback provided, otherwise send error.
 *
 * @param {*} req
 * @param {*} res
 * @param {*} err original error
 * @returns {*}
 * @private
 */
function sendErrorFallback(req, res, err) {
    var fallback = req.param('fallback');
    if (!fallback) {
        return sendError(req, res, err);
    }
    DEBUG && debug('download fallback:', fallback);
    // fallback to url
    if (/^https?:\/\//.test(fallback)) {
        return {url: fallback};
    }
    // fallback to file id
    return pictor.getFile(fallback)
        .then(function (result) {
            return sendFile(req, res, result);
        })
        .fail(function (fallbackErr) {
            DEBUG && debug('***ignore*** failed to download fallback:', fallbackErr);
            return sendError(req, res, err);
        })
        .done();
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
 * @protected
 */
function sendError(req, res, err) {
//    DEBUG && debug('*** send error', err);

    // TODO: cleanup error response...
    var status = (err && (err.status || err.code)) || 500;
    var result = {
        error: {
            status: status,
            message: (err && err.message) || 'internal server error',
            code: (err && err.code) || 0,
            cause: (err && err.cause),
            stack: (err && err.stack && err.stack.split('\n')) || []
        }
    };

    if (!!req.param('iframe')) {
        return sendResultIframe(res, status, result);
    }

    return res.status(status).jsonp(result);
}

/**
 * send success response with result data(json) or status code.
 *
 * result is one of followings:
 * - object: 200 ok with json contains id, url, ...
 * - object with request param 'callback': 200 ok with jsonp contains id, url, ...
 * - object with request param 'iframe': 200 ok with html contains id, url, ...
 * - 201: created without body
 * - 202: accepted without body
 * - 204: no content without body
 *
 * @param {*} req
 * @param {*} res
 * @param {PictorFile|Array.<PictorFile>|number} result result data(json) or status code
 * @returns {*}
 * @private
 */
function sendResult(req, res, result) {
//    DEBUG && debug('*** send result', result);

    if (_.isNumber(result)) {
        return res.status(result);
    }
    if (_.isObject(result) || _.isArray(result)) {
        if (!!req.param('iframe')) {
            return sendResultIframe(res, 200, result);
        }
        return res.jsonp(result);
    }
    // internal server error
    return sendError(req, res);
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
 * @param {number} [redirect] redirect status code. 301,302,307 to redirect, false to proxy
 * @returns {*}
 * @private
 */
function sendFile(req, res, result, redirect) {
    if (!_.isObject(result)) {
        return sendError(req, res); // internal server error
    }

    if (redirect) { // redirect is enabled by configuration
        if (result.url) {
            DEBUG && debug('*** redirect:', redirect, result.url);
            return res.redirect(redirect, result.url);
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
        return res.sendFile(result.file);
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
    return sendError(req, res); // internal server error
}

function sendResultDefer(req, res, promise, status) {
    return Q.when(promise)
        .then(function (result) {
            return sendResult(req, res, status || result);
        })
        .fail(function (err) {
            return sendError(req, res, err);
        })
        .done();
}

function sendFileDefer(req, res, promise) {
    return Q.when(promise)
        .then(function (result) {
            return sendFile(req, res, result);
        })
        .fail(function (err) {
            return sendErrorFallback(req, res, err);
        })
        .done();
}

module.exports = {
    sendResult: sendResult,
    sendError: sendError,
    sendResultDefer: sendResultDefer,
    sendFileDefer: sendFileDefer
};
