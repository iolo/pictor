'use strict';

var
  fs = require('fs'),
  util = require('util'),
  Q = require('q'),
  ftp = require('ftp'),
  StorageProvider = require('./storage').StorageProvider,
  debug = require('debug')('pictor:storage:ftp'),
  DEBUG = debug.enabled;

/**
 * ftp based implementation of {@link StorageProvider}.
 *
 * `config` contains:
 *
 *    - {string} host: ftp server host
 *    - {number} port: ftp server port
 *    - {string} username: ftp server username
 *    - {string} password: ftp server password
 *
 * @param config
 * @constructor
 */
function FtpStorageProvider(config) {
  FtpStorageProvider.super_.apply(this, arguments);
  this.ftpClientOpts = {host: config.host, port: config.port, user: config.username, password: config.password};
  // TODO: 연결 유지...
  //process.on('exit',this.ftpClient.end.bind(this.ftpClient));
  DEBUG && debug('create ftp storage provider: ', config);
}
util.inherits(FtpStorageProvider, StorageProvider);

FtpStorageProvider.prototype._withFtpClient = function (callback) {
  var d = Q.defer();
  var ftpClient = new ftp();
  ftpClient.on('ready', function () {
    DEBUG && debug('----------ftp ready!');
    return d.resolve(callback(ftpClient).fin(function () {
      ftpClient.close();
    }));
  });
  ftpClient.on('error', function (err) {
    DEBUG && debug('----------ftp error!', err);
    return d.reject(err);
  });
  ftpClient.on('close', function (hadErr) {
    DEBUG && debug('----------ftp close!', hadErr);
    //return (hadErr) ? d.reject(hadErr) : d.resolve();
  });
  ftpClient.on('end', function () {
    DEBUG && debug('----------ftp end!');
    //return d.reject(true);
  });
  ftpClient.connect(this.ftpClientOpts);
  return d.promise;
};

FtpStorageProvider.prototype.exists = function (storagePath) {
  // TODO: 매번 네트웍을 통해 확인하지 않도록... 캐싱...
  DEBUG && debug('ftp.exists', storagePath);
  return this._withFtpClient(function (ftpClient) {
    return Q.ninvoke(ftpClient, 'lastMod', storagePath);
    //return Q.ninvoke(this.ftpClient, 'size', path);
  });
};

FtpStorageProvider.prototype.putFile = function (filePath, storagePath) {
  DEBUG && debug('ftp.putFile', filePath, '---->', storagePath);
  // TODO: ensure directory exists!
  return this._withFtpClient(function (ftpClient) {
    return Q.ninvoke(ftpClient, 'put', filePath, storagePath);
  });
};

FtpStorageProvider.prototype.getFile = function (filePath, storagePath) {
  DEBUG && debug('ftp.getFile', filePath, '<----', storagePath);
  return this._withFtpClient(function (ftpClient) {
    var d = Q.defer();
    ftpClient.put(filePath, storagePath, function (err, stream) {
      if (err) {
        return d.reject(err);
      }
      stream.once('close', function () {
        return d.resolve(true);
      });
      stream.pipe(fs.createWriteStream(filePath));
    });
    return d.promise;
  });
};

FtpStorageProvider.prototype.deleteFile = function (storagePath) {
  DEBUG && debug('ftp.deleteFile', storagePath);
  return this._withFtpClient(function (ftpClient) {
    return Q.ninvoke(ftpClient, 'delete', storagePath);
  });
};

module.exports = {
  FtpStorageProvider: FtpStorageProvider
};
