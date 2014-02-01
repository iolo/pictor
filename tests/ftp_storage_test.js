'use strict';

var
    fs = require('fs'),
    Q = require('q'),
    test_config = {
        "host": "jdongsu.jpg2.kr",
        "port": 21,
        "username": process.env.PICTOR_FTP_USERNAME,
        "password": process.env.PICTOR_FTP_PASSWORD,
        "baseDir": "/pictor/test/",
        "baseUrl": "http://jdongsu.jpg2.kr/pictor/test/"
    },
    exist_id = 'exist.txt',
    exist_file = '/pictor/test/' + exist_id,
    notexist_id = 'notexist.txt',
    notexist_file = '/pictor/test/' + notexist_id,
    src_txt = __dirname + '/test.txt',
    dst_txt = '/tmp/pictor_ftp_storage_test_dst.txt',
    FtpStorage = require('../libs/storage/ftp'),
    s = new FtpStorage(test_config);

module.exports = {
    setUp: function (callback) {

        if (fs.existsSync(dst_txt)) {
            fs.unlinkSync(dst_txt);
        }

        var ftp = require('ftp');
        var c = new ftp();
        c.on('ready', function () {
            c.delete(notexist_file, function (err) {
                c.put(src_txt, exist_file, function (err) {
                    c.end();
                });
            });
        });
        c.on('end', function () {
            console.log('setUp end!', arguments);
            callback();
        });
        c.connect(s.ftpClientOpts);
    },
    test_putFile: function (test) {
        return s.putFile(notexist_id, src_txt)
            .then(function (result) {
                console.log('putFile ok', result);
                test.ok(result);
                return s._withFtpClient(function (ftpClient) {
                    return Q.ninvoke(ftpClient, 'get', notexist_file);
                });
            })
            .then(function (get_stream) {
                console.log('get ok');
                var d = Q.defer();
                get_stream.pipe(fs.createWriteStream(dst_txt))
                    .on('error', function (err) {
                        return d.reject(err);
                    })
                    .on('finish', function () {
                        return d.resolve(true);
                    });
                return d.promise;
            })
            .then(function () {
                var src_content = fs.readFileSync(src_txt, 'utf8');
                var dst_content = fs.readFileSync(dst_txt, 'utf8');
                test.equal(dst_content, src_content);
            })
            .fail(function (err) {
                console.log('putFile err', err);
                test.ifError(err);
            })
            .done(test.done);
    },
    test_getFile_exist: function (test) {
        s.getFile(exist_id)
            .then(function (result) {
                console.log('getFile_exist ok');
                test.ok(result);
                test.ok(result.stream);
                var d = Q.defer();
                result.stream.pipe(fs.createWriteStream(dst_txt))
                    .on('error', function (err) {
                        return d.reject(err);
                    })
                    .on('finish', function () {
                        return d.resolve(true);
                    });
                return d.promise;
            })
            .then(function () {
                var src_content = fs.readFileSync(src_txt, 'utf8');
                var dst_content = fs.readFileSync(dst_txt, 'utf8');
                test.equal(dst_content, src_content);
            })
            .fail(function (err) {
                console.log('getFile_exist err', err);
                test.ifError(err);
            })
            .done(test.done);
    },
    test_getFile_notexist: function (test) {
        s.getFile(notexist_id)
            .then(function (result) {
                console.log('getFile_notexist ok');
                test.fail(result);
            })
            .fail(function (err) {
                console.log('getFile_notexist err', err);
                test.ok(err);
                //test.ok(err.status, 404);
            })
            .done(test.done);
    },
    test_deleteFile_exist: function (test) {
        s.deleteFile(exist_id)
            .then(function (result) {
                console.log('deleteFile_exist ok', result);
                return s._withFtpClient(function (ftpClient) {
                    return Q.ninvoke(ftpClient, 'size', exist_file)
                        .then(function (result) {
                            console.log('get deleted file ok:', result);
                            test.fail(result);
                        })
                        .fail(function (err) {
                            console.log('get deleted file err:', err);
                            test.ok(err);
                            //test.ok(err.status, 404);
                        });
                });
            })
            .fail(function (err) {
                console.log('deleteFile_exist err', err);
                test.ifError(err);
            })
            .done(test.done);
    },
    test_deleteFile_notexist: function (test) {
        s.deleteFile(notexist_id)
            .then(function (result) {
                console.log('deleteFile_notexist ok', result);
                test.fail(result);
            })
            .fail(function (err) {
                console.log('deleteFile_notexist err', err);
                test.ok(err);
                //test.ok(err.status, 404);
            })
            .done(test.done);
    }
};
