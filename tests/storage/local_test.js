'use strict';

var
    fs = require('fs'),
    test_config = {
        "baseDir": "/tmp/pictor/test/",
        "baseUrl": "http://localhost:3000/pictor/test/"
    },
    LocalStorage = require('../../libs/storage/local'),
    s = new LocalStorage(test_config),
    assert = require('assert'),
    fixtures = require('../fixtures'),
    debug = require('debug')('test');

describe('local storage', function () {
    beforeEach(fixtures.setupStorageTestFiles);

    it('putFile', function (done) {
        s.putFile(fixtures.not_exist_id, fixtures.src_txt)
            .then(function (result) {
                debug('putFile ok', result);
                assert.ok(result);
                assert.equal(result.file, fixtures.not_exist_file);
                var src_content = fs.readFileSync(fixtures.src_txt, 'utf8');
                var res_content = fs.readFileSync(result.file, 'utf8');
                assert.equal(src_content, res_content);
            })
            .fail(function (err) {
                debug('putFile err', err);
                assert.ifError(err);
            })
            .done(done);
    });
    it('getFile_exist', function (done) {
        s.getFile(fixtures.exist_id)
            .then(function (result) {
                debug('getFile_exist ok', result);
                assert.ok(result);
                assert.equal(result.file, fixtures.exist_file);
                var res_content = fs.readFileSync(result.file, 'utf8');
                assert.equal(res_content, fixtures.exist_file_content);
            })
            .fail(function (err) {
                debug('getFile_exist err', err);
                assert.ifError(err);
            })
            .done(done);
    });
    it('getFile_not_exist', function (done) {
        s.getFile(fixtures.not_exist_id)
            .then(function (result) {
                debug('getFile_not_exist ok', result);
                assert.fail();
            })
            .fail(function (err) {
                debug('getFile_not_exist err', err);
                assert.ok(err);
                assert.equal(err.code, 404);
            })
            .done(done);
    });
    it('deleteFile_exist', function (done) {
        s.deleteFile(fixtures.exist_id)
            .then(function (result) {
                debug('deleteFile_exist ok', result);
                assert.ok(!fs.existsSync(fixtures.exist_file));
            })
            .fail(function (err) {
                debug('deleteFile_exist err', err);
                assert.ifError(err);
            })
            .done(done);
    });
    it('deleteFile_not_exist', function (done) {
        s.deleteFile(fixtures.not_exist_id)
            .then(function (result) {
                debug('deleteFile_not_exist ok', result);
                assert.fail();
            })
            .fail(function (err) {
                debug('deleteFile_not_exist err', err);
                assert.ok(err);
                assert.equal(err.code, 404);
            })
            .done(done);
    });
    it('renameFile', function (done) {
        s.renameFile(fixtures.exist_id, fixtures.not_exist_id)
            .then(function (result) {
                debug('renameFile ok', result);
                assert.ok(result);
            })
            .fail(function (err) {
                debug('renameFile err', err);
                assert.ifError(err);
            })
            .done(done);
    });
    it('listFiles', function (done) {
        s.listFiles({})
            .then(function (result) {
                debug('listFiles ok', result);
                assert.ok(result);
                assert.equal(result.length, 1);
            })
            .fail(function (err) {
                debug('listFiles err', err);
                assert.ifError(err);
            })
            .done(done);
    });
});
