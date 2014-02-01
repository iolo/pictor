'use strict';

var
    fs = require('fs'),
    test_config = {
        "baseDir": "/tmp/pictor/test/",
        "baseUrl": "http://localhost:3000/pictor/test/"
    },
    exist_id = 'exist.txt',
    exist_file = '/tmp/pictor/test/' + exist_id,
    exist_file_content = 'show me the money!',
    notexist_id = 'notexist.txt',
    notexist_file = '/tmp/pictor/test/' + notexist_id,
    src_txt = __dirname + '/test.txt',
    dst_txt = '/tmp/pictor_s3_storage_test_dst.txt',
    LocalStorage = require('../libs/storage/local'),
    s = new LocalStorage(test_config);

module.exports = {
    setUp: function (callback) {

        fs.writeFile(exist_file, exist_file_content, 'utf8');

        if (fs.existsSync(notexist_file)) {
            fs.unlinkSync(notexist_file);
        }

        if (fs.existsSync(dst_txt)) {
            fs.unlinkSync(dst_txt);
        }

        setTimeout(function () {
            callback();
        }, 100);
    },
    test_putFile: function (test) {
        s.putFile(notexist_id, src_txt)
            .then(function (result) {
                console.log('putFile ok', result);
                test.ok(result);
                test.equal(result.file, notexist_file);
                var src_content = fs.readFileSync(src_txt, 'utf8');
                var res_content = fs.readFileSync(result.file, 'utf8');
                test.equal(src_content, res_content);
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
                console.log('getFile_exist ok', result);
                test.ok(result);
                test.equal(result.file, exist_file);
                var res_content = fs.readFileSync(result.file, 'utf8');
                test.equal(res_content, exist_file_content);
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
                console.log('getFile_notexist ok', result);
                test.fail();
            })
            .fail(function (err) {
                console.log('getFile_notexist err', err);
                test.ok(err);
                test.equal(err.status, 404);
            })
            .done(test.done);
    },
    test_deleteFile_exist: function (test) {
        s.deleteFile(exist_id)
            .then(function (result) {
                console.log('deleteFile_exist ok', result);
                test.ok(!fs.existsSync(exist_file));
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
                test.fail();
            })
            .fail(function (err) {
                console.log('deleteFile_notexist err', err);
                test.ok(err);
                test.equal(err.status, 404);
            })
            .done(test.done);
    },
    test_renameFile: function (test) {
        s.renameFile(exist_id, notexist_id)
            .then(function (result) {
                console.log('renameFile ok', result);
                test.ok(result);
            })
            .fail(function (err) {
                console.log('renameFile err', err);
                test.ifError(err);
            })
            .done(test.done);
    },
    test_listFiles: function (test) {
        s.listFiles({})
            .then(function (result) {
                console.log('listFiles ok', result);
                test.ok(result);
                test.equal(result.length, 1);
            })
            .fail(function (err) {
                console.log('listFiles err', err);
                test.ifError(err);
            })
            .done(test.done);
    }
};
