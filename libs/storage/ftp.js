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
  this.ftpClientOpts = {host: config.host, port: config.port, user: config.username, password: config.password};
  DEBUG && debug('create ftp storage: ', config);
}
util.inherits(FtpStorage, storage.Storage);

FtpStorage.prototype._withFtpClient = function (callback) {
  var d = Q.defer();
  var ftpClient = new ftp();
  ftpClient.on('ready', function () {
    console.log('*** ftp ready!');
    callback(ftpClient)
      .then(function (result) {
        console.log('*** ftp worker then:', result);
        return d.resolve(result);
      })
      .fail(function (err) {
        console.log('*** ftp worker fail:', err);
        return d.reject(err);
      })
      .fin(function () {
        console.log('*** ftp worker fin: close');
        ftpClient.close();
      });
  });
  ftpClient.on('error', function (err) {
    console.log('*** ftp error!', err);
    return d.reject(err);
  });
  ftpClient.on('close', function (hadErr) {
    console.log('*** ftp close!', hadErr);
    //return (hadErr) ? d.reject(hadErr) : d.resolve();
  });
  ftpClient.on('end', function () {
    console.log('*** ftp end!');
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
        //ignore err
        //directory already exists!
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
      });
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
      });
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
    return _removeTree(ftpClient, src);
  });
};

module.exports = FtpStorage;
