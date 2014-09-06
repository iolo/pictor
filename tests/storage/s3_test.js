'use strict';

var
    fs = require('fs'),
    Q = require('q'),
    test_config = {
        'key': process.env.PICTOR_S3_KEY,
        'secret': process.env.PICTOR_S3_SECRET,
        'bucket': 's3pictor',
        'baseDir': 'pictor/test/',
        'baseUrl': 'http://s3.amazonaws.com/s3pictor/pictor/test/'
    },
    knox = require('knox'),
    s3c = knox.createClient({key: test_config.key, secret: test_config.secret, bucket: test_config.bucket}),
    S3Storage = new require('../../libs/storage/s3'),
    s = new S3Storage(test_config),
    assert = require('assert'),
    fixtures = require('../fixtures'),
    debug = require('debug')('test');

describe('s3 storage', function () {
    before(function (done) {
        fixtures.setupStorageTestFiles();

        s3c.deleteFile(fixtures.not_exist_file, function () {
            s3c.putFile(fixtures.src_txt, fixtures.exist_file, function () {
                done();
            });
        });
    });

    it('putFile', function (done) {
        return s.putFile(fixtures.not_exist_id, fixtures.src_txt)
            .then(function (result) {
                debug('putFile ok', result);
                assert.ok(result);
                return Q.ninvoke(s3c, 'getFile', fixtures.not_exist_file);
            })
            .then(function (get_stream) {
                debug('get ok');
                var d = Q.defer();
                get_stream.pipe(fs.createWriteStream(fixtures.dst_txt))
                    .on('error', function (err) {
                        return d.reject(err);
                    })
                    .on('finish', function () {
                        return d.resolve(true);
                    });
                return d.promise;
            })
            .then(function () {
                var src_content = fs.readFileSync(fixtures.src_txt, 'utf8');
                var dst_content = fs.readFileSync(fixtures.dst_txt, 'utf8');
                assert.equal(dst_content, src_content);
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
                debug('getFile_exist ok');
                assert.ok(result);
                assert.ok(result.stream);
                var d = Q.defer();
                result.stream.pipe(fs.createWriteStream(fixtures.dst_txt))
                    .on('error', function (err) {
                        return d.reject(err);
                    })
                    .on('finish', function () {
                        return d.resolve(true);
                    });
                return d.promise;
            })
            .then(function () {
                var src_content = fs.readFileSync(fixtures.src_txt, 'utf8');
                var dst_content = fs.readFileSync(fixtures.dst_txt, 'utf8');
                assert.equal(dst_content, src_content);
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
                debug('getFile_not_exist ok');
                assert.fail(result);
            })
            .fail(function (err) {
                debug('getFile_not_exist err', err);
                assert.ok(err);
                //assert.ok(err.status, 404);
            })
            .done(done);
    });
    it('deleteFile_exist', function (done) {
        s.deleteFile(fixtures.exist_id)
            .then(function (result) {
                debug('deleteFile_exist ok', result.statusCode, result.headers);
                var d = Q.defer();
                s3c.head(fixtures.exist_file).on('response', function (res) {
                    debug('head deleted file ok:', res.statusCode, res.headers);
                    assert.equal(res.statusCode, 404);
                    return d.resolve();
                }).end();
                return d.promise;
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
                // XXX: s3 doesn't report error when delete not-existing file. :S
                assert.ok(result);
                //assert.fail(result);
            })
            .fail(function (err) {
                debug('deleteFile_not_exist err', err);
                // XXX: s3 doesn't report error when delete not-existing file. :S
                assert.fail();
                //assert.ok(err);
                //assert.ok(err.status, 404);
            })
            .done(done);
    });
});
