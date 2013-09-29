'use strict';

var
  util = require('util'),
  path = require('path'),
  Q = require('q'),
  ftp = require('ftp'),
  storage = require('./storage'),
  debug = require('debug')('pictor:storage:ftp'),
  DEBUG = debug.enabled;

/**
 * ftp based implementation of {@link Storage}.
 *
 * TODO: connection keep alive and/or pooling...
 *
 * `config` contains:
 *
 *    - {string} host: ftp server host
 *    - {number} port: ftp server port
 *    - {string} username: ftp server username
 *    - {string} password: ftp server password
 *    - {string} baseDir: base directory to store files
 *    - {string} [baseUrl]: http url to access `baseDir`
 *
 * NOTE: `config.baseUrl` should be `null` when this storage doesn't support http access.
 *
 * @param {object} config
 * @constructor
 */
function FtpStorage(config) {
  FtpStorage.super_.apply(this, arguments);
  this.ftpClientOpts = {host: this.config.host, port: this.config.port, user: this.config.username, password: this.config.password};
  DEBUG && debug('create ftp storage:', this.config);
}
util.inherits(FtpStorage, storage.Storage);

// TODO: more robust connection management: keep alive or pooling...
FtpStorage.prototype._withFtpClient = function (callback) {
  var d = Q.defer();
  var ftpClient = new ftp();
  ftpClient.on('ready', function () {
    DEBUG && debug('*** ftp ready!');
    callback(ftpClient)
      .then(function (result) {
        DEBUG && debug('*** ftp worker then:', typeof(result));
        return d.resolve(result);
      })
      .fail(function (err) {
        DEBUG && debug('*** ftp worker fail:', err);
        return d.reject(err);
      })
      .done();
    // XXX: for some operation, wait until stream is closed...
    setTimeout(function () {
      ftpClient.end();
    }, 1000);
  });
  ftpClient.on('error', function (err) {
    DEBUG && debug('*** ftp error!', err);
    //return d.reject(err);
  });
  ftpClient.on('close', function (hadErr) {
    DEBUG && debug('*** ftp close!', hadErr);
    //return (hadErr) ? d.reject(hadErr) : d.resolve();
  });
  ftpClient.on('end', function () {
    DEBUG && debug('*** ftp end!');
    //return d.reject(true);
  });
  ftpClient.connect(this.ftpClientOpts);
  return d.promise;
};

FtpStorage.prototype.putFile = function (id, src) {
  DEBUG && debug('ftp.putFile', src, '---->', id);
  var dst = this._getPath(id);
  var url = this._getUrl(id);
  return this._withFtpClient(function (ftpClient) {
    return Q.ninvoke(ftpClient, 'mkdir', path.dirname(dst), true)
      .fail(function () {
        //ignore err - directory already exists!
        return true;
      })
      .then(function () {
        return Q.ninvoke(ftpClient, 'put', src, dst);
      })
      .then(function () {
        return {
          url: url,
          file: src
        };
      })
      .fail(storage.wrapError);
  });
};

FtpStorage.prototype.getFile = function (id) {
  DEBUG && debug('ftp.getFile', id);
  var src = this._getPath(id);
  var url = this._getUrl(id);
  return this._withFtpClient(function (ftpClient) {
    return Q.ninvoke(ftpClient, 'get', src)
      .then(function (stream) {
        stream.once('close', function () {
          ftpClient.end();
        });
        return {
          url: url,
          stream: stream
        };
      })
      .fail(storage.wrapError);
  });
};

FtpStorage.prototype.deleteFile = function (id) {
  DEBUG && debug('ftp.deleteFile', id);

  function _removeTree(ftpClient, src) {
    // assume 'src' is file
    return Q.ninvoke(ftpClient, 'delete', src)
      .fail(function (err) {
        // err... assume 'src' is directory
        return Q.ninvoke(ftpClient, 'list', src)
          .then(function (files) {
            return Q.all(files.map(function (file) {
                // async recursion :S
                return _removeTree(ftpClient, path.join(src, file.name));
              })).then(function () {
                return Q.ninvoke(ftpClient, 'rmdir', src);
              });
          });
      })
      .then(function () {
        return true;
      });
  }

  var src = this._getPath(id);
  return this._withFtpClient(function (ftpClient) {
    return _removeTree(ftpClient, src)
      .fail(storage.wrapError);
  });
};

module.exports = FtpStorage;
