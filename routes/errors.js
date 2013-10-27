'use strict';

var
  util = require('util'),
  StatusCode = { // see http://en.wikipedia.org/wiki/List_of_HTTP_status_codes
    OK: 200,
    CREATED: 201,
    ACCEPTED: 202,
    NO_CONTENT: 204,
    MULTIPLE_CHOICES: 300,
    MOVED_PERMANENTLY: 301,
    FOUND: 302,
    NOT_MODIFIED: 304,
    TEMPORARY_REDIRECT: 307,
    CLIENT_ERROR: 400,
    BAD_REQUEST: 400,
    UNAUTHORIZED: 401,
    FORBIDDEN: 403,
    NOT_FOUND: 404,
    SERVER_ERROR: 500,
    INTERNAL_SERVER_ERROR: 500,
    NOT_IMPLEMENTED: 501,
    UNKNOWN: 599
  },
  StatusLine = {
    200: 'OK',
    201: 'Created',
    202: 'Accepted',
    204: 'No Content',
    300: 'Multiple_Choices',
    301: 'Moved_Permanently',
    302: 'Found',
    304: 'Not_Modified',
    307: 'Temporary_Redirect',
    400: 'Bad Request',
    401: 'Unauthorized',
    403: 'Forbidden',
    404: 'Not Found',
    500: 'Internal Server Error',
    501: 'Not Implemented',
    599: 'Unknown Http Error'
  };

/**
 * abstract superclass for HTTP specific error.
 *
 * @param {String} [message]
 * @param {int} [status]
 * @param {*} [cause]
 * @constructor
 * @extends Error
 * @abstract
 */
function HttpError(message, status, cause) {
  this.status = status || StatusCode.UNKNOWN;
  this.message = message || StatusLine[this.status] || StatusLine[StatusCode.UNKNOWN];
  this.cause = cause;
  HttpError.super_.call(this);
}
util.inherits(HttpError, Error);
HttpError.prototype.name = 'HttpError';
HttpError.prototype.toString = function () {
  return 'HttpError#' + this.status + ': ' + this.message;
};

/**
 * abstract superclass for HTTP client error(4xx).
 *
 * @param {String} [message]
 * @param {int} [status=400]
 * @param {*} [cause]
 * @constructor
 * @extends HttpError
 * @abstract
 */
function ClientError(message, status, cause) {
  ClientError.super_.call(this, message, status || StatusCode.CLIENT_ERROR, cause);
}
util.inherits(ClientError, HttpError);
ClientError.prototype.name = 'ClientError';

/**
 * HTTP bad request error(400).
 *
 * @param {String} [message]
 * @param {*} [cause]
 * @constructor
 * @extends ClientError
 */
function BadRequest(message, cause) {
  BadRequest.super_.call(this, message, StatusCode.BAD_REQUEST, cause);
}
util.inherits(BadRequest, ClientError);
BadRequest.prototype.name = 'BadRequest';

/**
 * HTTP unauthorized error(401).
 *
 * @param {String} [message]
 * @param {*} [cause]
 * @constructor
 * @extends ClientError
 */
function Unauthorized(message, cause) {
  Unauthorized.super_.call(this, message, StatusCode.UNAUTHORIZED, cause);
}
util.inherits(Unauthorized, ClientError);
Unauthorized.prototype.name = 'Unauthorized';

/**
 * HTTP forbidden error(403).
 *
 * @param {String} [message]
 * @param {*} [cause]
 * @constructor
 * @extends ClientError
 */
function Forbidden(message, cause) {
  Forbidden.super_.call(this, message, StatusCode.FORBIDDEN, cause);
}
util.inherits(Forbidden, ClientError);
Forbidden.prototype.name = 'Forbidden';

/**
 * HTTP not found error(404).
 *
 * @param {String} [message]
 * @param {*} [cause]
 * @constructor
 * @extends ClientError
 */
function NotFound(message, cause) {
  NotFound.super_.call(this, message, StatusCode.NOT_FOUND, cause);
}
util.inherits(NotFound, ClientError);
NotFound.prototype.name = 'NotFound';

/**
 * abstract superclass for HTTP client error(5xx).
 *
 * @param {String} [message]
 * @param {int} [status]
 * @param {*} [cause]
 * @constructor
 * @extends HttpError
 * @abstract
 */
function ServerError(message, status, cause) {
  ServerError.super_.call(this, message, status || StatusCode.SERVER_ERROR, cause);
}
util.inherits(ServerError, HttpError);
ServerError.prototype.name = 'ServerError';

/**
 * HTTP internal server error(500).
 *
 * @param {String} [message]
 * @param {*} [cause]
 * @constructor
 * @extends ServerError
 */
function InternalServerError(message, cause) {
  InternalServerError.super_.call(this, message, StatusCode.INTERNAL_SERVER_ERROR, cause);
}
util.inherits(InternalServerError, ServerError);
InternalServerError.prototype.name = 'InternalServerError';

/**
 * HTTP not implemented error(501).
 *
 * @param {String} [message]
 * @param {*} [cause]
 * @constructor
 * @extends ServerError
 */
function NotImplemented(message, cause) {
  NotImplemented.super_.call(this, message, StatusCode.NOT_IMPLEMENTED, cause);
}
util.inherits(NotImplemented, ServerError);
NotImplemented.prototype.name = 'NotImplemented';

module.exports = {
  StatusCode: StatusCode,
  StatusLine: StatusLine,
  HttpError: HttpError,
  ClientError: ClientError,
  BadRequest: BadRequest,
  Unauthorized: Unauthorized,
  Forbidden: Forbidden,
  NotFound: NotFound,
  ServerError: ServerError,
  InternalServerError: InternalServerError,
  NotImplemented: NotImplemented
};
