var
  fs = require('fs'),
  Q = require('q'),
  debug = require('debug')('pictor:fileutils'),
  DEBUG = debug.enabled;

/**
 * check a file exist or not.
 *
 * @param {string} filepath
 * @returns {promise} exists or not
 */
function exists(filepath) {
  var d = Q.defer();
  fs.exists(filepath, function (exists) {
    return (exists) ? d.resolve() : d.reject();
  });
  return d.promise;
}

/**
 * copy a file.
 *
 * @param {string} src
 * @param {string} dst
 * @returns {promise} success or not
 */
function copyFile(src, dst) {
  DEBUG && debug('copy file:', src, '--->', dst);
  var d = Q.defer();
  var rs = fs.createReadStream(src);
  rs.on('error', function (err) {
    return d.reject(err);
  });
  var ws = fs.createWriteStream(dst);
  ws.on('error', function (err) {
    return d.reject(err);
  });
  ws.on('close', function () {
    return d.resolve(true);
  });
  rs.pipe(ws);
  return d.promise;
}

/**
 * delete a file.
 *
 * @param {string} filepath
 * @returns {promise} success or not
 */
function deleteFile(filepath) {
  DEBUG && debug('delete file:', filepath);
  return Q.ninvoke(fs, 'unlink', filepath);
}

/**
 * write string data into a file.
 * @param {string} filepath
 * @param {string} data
 * @returns {promise} success or not
 */
function writeFile(filepath, data) {
  DEBUG && debug('write file:', filepath);
  return Q.ninvoke(fs, 'writeFile', filepath, data);
}

module.exports = {
  exists: exists,
  copyFile: copyFile,
  deleteFile: deleteFile,
  writeFile: writeFile
};
