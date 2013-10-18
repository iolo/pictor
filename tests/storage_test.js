'use strict';

var
  storage = require('../libs/storage/storage');

module.exports = {
  test_trailingSlash: function (test) {
    var s1 = new storage.Storage({baseDir: 'baseDir', baseUrl: 'baseUrl'});
    test.equal(s1.config.baseDir, 'baseDir/');
    test.equal(s1.config.baseUrl, 'baseUrl/');

    var s2 = new storage.Storage({baseDir: 'baseDir/', baseUrl: 'baseUrl/'});
    test.equal(s2.config.baseDir, 'baseDir/');
    test.equal(s2.config.baseUrl, 'baseUrl/');

    var s3 = new storage.Storage({baseDir: '', baseUrl: ''});
    test.equal(s3.config.baseDir, '');
    test.equal(s3.config.baseUrl, '');

    var s3 = new storage.Storage({baseDir: null, baseUrl: null});
    test.equal(s3.config.baseDir, null);
    test.equal(s3.config.baseUrl, null);

    test.done();
  },
  test_getPath: function (test) {
    var s1 = new storage.Storage({baseDir: 'baseDir'});
    test.equal('baseDir/test', s1._getPath('test'));
    test.equal('baseDir/', s1._getPath(''));
    test.equal('baseDir/', s1._getPath(null));
    test.done();
  },
  test_getUrl: function (test) {
    var s1 = new storage.Storage({baseUrl: 'baseUrl'});
    test.equal('baseUrl/test', s1._getUrl('test'));
    test.equal('baseUrl/', s1._getUrl(''));
    test.equal('baseUrl/', s1._getUrl(null));
    test.done();
  },
  test_getUrl_null: function (test) {
    var s1 = new storage.Storage({baseUrl: ''});
    test.equal(null, s1._getUrl('test'));
    test.equal(null, s1._getUrl(''));
    test.equal(null, s1._getUrl(null));
    var s2 = new storage.Storage({baseUrl: null});
    test.equal(null, s2._getUrl('test'));
    test.equal(null, s2._getUrl(''));
    test.equal(null, s2._getUrl(null));
    var s3 = new storage.Storage({baseUrl: undefined});
    test.equal(null, s3._getUrl('test'));
    test.equal(null, s3._getUrl(''));
    test.equal(null, s3._getUrl(null));
    test.done();
  },
  test_putFile: function (test) {
    var s = new storage.Storage();
    s.putFile()
      .then(function (result) {
        console.log('putFile ok', result);
        test.fail();
      })
      .fail(function (err) {
        console.log('putFile err', err);
        test.ok(err);
      })
      .done(test.done);
  },
  test_getFile: function (test) {
    var s = new storage.Storage();
    s.getFile()
      .then(function (result) {
        console.log('getFile ok', result);
        test.fail();
      })
      .fail(function (err) {
        console.log('getFile err', err);
        test.ok(err);
      })
      .done(test.done);
  },
  test_deleteFile: function (test) {
    var s = new storage.Storage();
    s.deleteFile()
      .then(function (result) {
        console.log('deleteFile ok', result);
        test.fail();
      })
      .fail(function (err) {
        console.log('deleteFile err', err);
        test.ok(err);
      })
      .done(test.done);
  },
  test_renameFile: function (test) {
    var s = new storage.Storage();
    s.renameFile()
      .then(function (result) {
        console.log('renameFile ok', result);
        test.fail();
      })
      .fail(function (err) {
        console.log('renameFile err', err);
        test.ok(err);
      })
      .done(test.done);
  },
  test_listFiles: function (test) {
    var s = new storage.Storage();
    s.listFiles()
      .then(function (result) {
        console.log('listFiles ok', result);
        test.fail();
      })
      .fail(function (err) {
        console.log('listFiles err', err);
        test.ok(err);
      })
      .done(test.done);
  },
  test_wrapError: function (test) {
    storage.wrapError('some error')
      .then(function () {
        test.fail();
      })
      .fail(function (err) {
        console.log('wrapError err:', err);
        test.ok(err instanceof storage.StorageError);
        test.ok(err.status, 500);
        test.ok(err.cause, 'some error');
      })
      .done(test.done);
  },
  test_wrapError_notfound: function (test) {
    storage.wrapError({code: 'ENOENT'})
      .then(function () {
        test.fail();
      })
      .fail(function (err) {
        console.log('wrapError err:', err);
        test.ok(err instanceof storage.StorageError);
        test.ok(err.status, 404);
        test.ok(err.cause.code, 'ENOENT');
      })
      .done(test.done);
  }
//  test_sanitize_pass: function (test) {
//    var s = new storage.Storage();
//    var src = 'azAZ09가힣-_.';
//    var dst = s._sanitize(src);
//    console.log('sanitize:', src, '-->', dst);
//    test.equal(dst, src);
//    test.done();
//  },
//  test_sanitize_replaced: function (test) {
//    var s = new storage.Storage();
//    var src = '!_#$%^&*(){}[]<>';
//    var dst = s._sanitize(src);
//    console.log('sanitize:', src, '-->', dst);
//    test.equal(dst, '________________');
//    test.done();
//  }
};
