'use strict';

var
    fs = require('fs'),
    Q = require('q'),
    FTP = require('ftp'),
    FtpStorage = require('../../libs/storage/ftp'),
    assert = require('assert'),
    fixtures = require('../fixtures'),
    debug = require('debug')('test');

describe.skip('ftp storage', function () {
    var
        test_config = {
            "host": "jdongsu.jpg2.kr",
            "port": 21,
            "username": process.env.PICTOR_FTP_USERNAME || 'hello',
            "password": process.env.PICTOR_FTP_PASSWORD || 'world',
            "baseDir": "/pictor/test/",
            "baseUrl": "http://jdongsu.jpg2.kr/pictor/test/"
        },
        s = new FtpStorage(test_config);

    before(function (done) {
        fixtures.setupStorageTestFiles();

        var c = new FTP();
        c.on('ready', function () {
            c.delete(fixtures.not_exist_file, function () {
                c.put(fixtures.src_txt, fixtures.exist_file, function () {
                    c.end();
                });
            });
        });
        c.on('end', done);
        c.connect(s.ftpClientOpts);
    });
    it('putFile', function (done) {
        return s.putFile(fixtures.not_exist_id, fixtures.src_txt)
            .then(function (result) {
                debug('putFile ok', result);
                assert.ok(result);
                return s._withFtpClient(function (ftpClient) {
                    return Q.ninvoke(ftpClient, 'get', fixtures.not_exist_file);
                });
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
                //assert.ok(err.code, 404);
            })
            .done(done);
    });
    it('deleteFile_exist', function (done) {
        s.deleteFile(fixtures.exist_id)
            .then(function (result) {
                debug('deleteFile_exist ok', result);
                return s._withFtpClient(function (ftpClient) {
                    return Q.ninvoke(ftpClient, 'size', fixtures.exist_file)
                        .then(function (result) {
                            debug('get deleted file ok:', result);
                            assert.fail(result);
                        })
                        .fail(function (err) {
                            debug('get deleted file err:', err);
                            assert.ok(err);
                            //assert.ok(err.code, 404);
                        });
                });
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
                assert.fail(result);
            })
            .fail(function (err) {
                debug('deleteFile_not_exist err', err);
                assert.ok(err);
                //assert.ok(err.code, 404);
            })
            .done(done);
    });
});
