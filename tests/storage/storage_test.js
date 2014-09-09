'use strict';

var
    Storage = require('../../libs/storage/storage'),
    assert = require('assert'),
    debug = require('debug')('test');

describe('storage', function () {
    it('trailingSlash', function () {
        var s1 = new Storage({baseDir: 'baseDir', baseUrl: 'baseUrl'});
        assert.equal(s1.config.baseDir, 'baseDir/');
        assert.equal(s1.config.baseUrl, 'baseUrl/');

        var s2 = new Storage({baseDir: 'baseDir/', baseUrl: 'baseUrl/'});
        assert.equal(s2.config.baseDir, 'baseDir/');
        assert.equal(s2.config.baseUrl, 'baseUrl/');

        var s3 = new Storage({baseDir: '', baseUrl: ''});
        assert.equal(s3.config.baseDir, '');
        assert.equal(s3.config.baseUrl, '');

        var s3 = new Storage({baseDir: null, baseUrl: null});
        assert.equal(s3.config.baseDir, null);
        assert.equal(s3.config.baseUrl, null);
    });
    it('getPath', function () {
        var s1 = new Storage({baseDir: 'baseDir'});
        assert.equal('baseDir/test', s1._getPath('test'));
        assert.equal('baseDir/', s1._getPath(''));
        assert.equal('baseDir/', s1._getPath(null));
    });
    it('getUrl', function () {
        var s1 = new Storage({baseUrl: 'baseUrl'});
        assert.equal('baseUrl/test', s1._getUrl('test'));
        assert.equal('baseUrl/', s1._getUrl(''));
        assert.equal('baseUrl/', s1._getUrl(null));
    });
    it('getUrl_null', function () {
        var s1 = new Storage({baseUrl: ''});
        assert.equal(null, s1._getUrl('test'));
        assert.equal(null, s1._getUrl(''));
        assert.equal(null, s1._getUrl(null));
        var s2 = new Storage({baseUrl: null});
        assert.equal(null, s2._getUrl('test'));
        assert.equal(null, s2._getUrl(''));
        assert.equal(null, s2._getUrl(null));
        var s3 = new Storage({baseUrl: undefined});
        assert.equal(null, s3._getUrl('test'));
        assert.equal(null, s3._getUrl(''));
        assert.equal(null, s3._getUrl(null));
    });
    it('putFile', function (done) {
        var s = new Storage();
        s.putFile()
            .then(function (result) {
                debug('putFile ok', result);
                assert.fail();
            })
            .fail(function (err) {
                debug('putFile err', err);
                assert.ok(err);
                assert.equal(err.message, 'not_implemented');
                assert.equal(err.code, 501);
            })
            .done(done);
    });
    it('getFile', function (done) {
        var s = new Storage();
        s.getFile()
            .then(function (result) {
                debug('getFile ok', result);
                assert.fail();
            })
            .fail(function (err) {
                debug('getFile err', err);
                assert.ok(err);
                assert.ok(err instanceof Storage.Error);
                assert.equal(err.message, 'not_implemented');
                assert.equal(err.code, 501);
            })
            .done(done);
    });
    it('deleteFile', function (done) {
        var s = new Storage();
        s.deleteFile()
            .then(function (result) {
                debug('deleteFile ok', result);
                assert.fail();
            })
            .fail(function (err) {
                debug('deleteFile err', err);
                assert.ok(err);
                assert.equal(err.message, 'not_implemented');
                assert.equal(err.code, 501);
            })
            .done(done);
    });
    it('renameFile', function (done) {
        var s = new Storage();
        s.renameFile()
            .then(function (result) {
                debug('renameFile ok', result);
                assert.fail();
            })
            .fail(function (err) {
                debug('renameFile err', err);
                assert.ok(err);
                assert.equal(err.message, 'not_implemented');
                assert.equal(err.code, 501);
            })
            .done(done);
    });
    it('listFiles', function (done) {
        var s = new Storage();
        s.listFiles()
            .then(function (result) {
                debug('listFiles ok', result);
                assert.fail();
            })
            .fail(function (err) {
                debug('listFiles err', err);
                assert.ok(err);
                assert.equal(err.message, 'not_implemented');
                assert.equal(err.code, 501);
            })
            .done(done);
    });
    it('reject', function (done) {
        Storage.reject('some error')
            .then(function () {
                assert.fail();
            })
            .fail(function (err) {
                debug('reject err:', err);
                assert.ok(err instanceof Storage.Error);
                assert.equal(err.message, 'unknown_error');
                assert.equal(err.code, 500);
                assert.equal(err.cause, 'some error');
            })
            .done(done);
    });
    it('reject with StorageError', function (done) {
        Storage.reject(new Storage.Error('some error', 123, new Error('cause')))
            .then(function () {
                assert.fail();
            })
            .fail(function (err) {
                debug('reject err:', err);
                assert.ok(err instanceof Storage.Error);
                assert.equal(err.message, 'some error');
                assert.equal(err.code, 123);
                assert.equal(err.cause.message, 'cause');
            })
            .done(done);
    });
    it('reject with ENOENT', function (done) {
        Storage.reject({code: 'ENOENT'})
            .then(function () {
                assert.fail();
            })
            .fail(function (err) {
                debug('reject err:', err);
                assert.ok(err instanceof Storage.Error);
                assert.equal(err.message, 'not_found');
                assert.equal(err.code, 404);
                assert.equal(err.cause.code, 'ENOENT');
            })
            .done(done);
    });
//  it('sanitize_pass', function () {
//    var s = new storage.Storage();
//    var src = 'azAZ09가힣-_.';
//    var dst = s._sanitize(src);
//    debug('sanitize:', src, '-->', dst);
//    assert.equal(dst, src);
//  });
//  it('sanitize_replaced', function () {
//    var s = new storage.Storage();
//    var src = '!_#$%^&*(){}[]<>';
//    var dst = s._sanitize(src);
//    debug('sanitize:', src, '-->', dst);
//    assert.equal(dst, '________________');
//  });
});
