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
    s3c = require('knox').createClient({key: test_config.key, secret: test_config.secret, bucket: test_config.bucket}),
    exist_id = 'exist.txt',
    exist_file = 'pictor/test/' + exist_id,
    notexist_id = 'notexist.txt',
    notexist_file = 'pictor/test/' + notexist_id,
    src_txt = __dirname + '/test.txt',
    dst_txt = '/tmp/pictor_s3_storage_test_dst.txt',
    S3Storage = new require('../libs/storage/s3'),
    s = new S3Storage(test_config);

module.exports = {
    setUp: function (callback) {

        if (fs.existsSync(dst_txt)) {
            fs.unlinkSync(dst_txt);
        }

        s3c.deleteFile(notexist_file, function (err) {
            s3c.putFile(src_txt, exist_file, function (err) {
                callback();
            });
        });
    },
    test_putFile: function (test) {
        return s.putFile(notexist_id, src_txt)
            .then(function (result) {
                console.log('putFile ok', result);
                test.ok(result);
                return Q.ninvoke(s3c, 'getFile', notexist_file);
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
                console.log('deleteFile_exist ok', result.statusCode, result.headers);
                var d = Q.defer();
                s3c.head(exist_file).on('response',function (res) {
                    console.log('head deleted file ok:', res.statusCode, res.headers);
                    test.equal(res.statusCode, 404);
                    return d.resolve();
                }).end();
                return d.promise;
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
                // XXX: s3 doesn't report error when delete not-existing file. :S
                test.ok(result);
                //test.fail(result);
            })
            .fail(function (err) {
                console.log('deleteFile_notexist err', err);
                // XXX: s3 doesn't report error when delete not-existing file. :S
                test.fail();
                //test.ok(err);
                //test.ok(err.status, 404);
            })
            .done(test.done);
    }
};
