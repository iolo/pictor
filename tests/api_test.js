'use strict';

var
    fs = require('fs'),
    superagent = require('superagent'),
    utils = require('node-toybox').utils,
    server = require('express-toybox').server,
    config = require('../config'),
    TEST_HOST = 'localhost',
    TEST_PORT = 3001,
    TEST_URL = 'http://' + TEST_HOST + ':' + TEST_PORT + '/pictor',
    TEST_ID = 'foo.jpg',
    TEST_FILE = __dirname + '/test.jpg',
    debug = require('debug')('test');

module.exports = {
    setUp: function (callback) {
        server.start(require('../app').createApp(config), {host: TEST_HOST, port: TEST_PORT}, callback);
    },
    tearDown: function (callback) {
        server.stop(callback);
    },
    test_upload_ok: function (test) {
        superagent.agent().post(TEST_URL + '/' + TEST_ID)
            .attach('file', TEST_FILE, TEST_FILE)
            .end(function (err, res) {
                debug('upload -->', arguments, res.body);
                test.ifError(err);
                test.ok(res);
                test.equal(res.status, 200);
                test.equal(res.type, 'application/json');
                test.equal(res.body.id, TEST_ID);
                test.equal(fs.statSync(res.body.file).size, fs.statSync(TEST_FILE).size);
                test.done();
            });
    },
    test_upload_ok_new: function (test) {
        superagent.agent().post(TEST_URL + '/new')
            .attach('file', TEST_FILE, TEST_FILE)
            .end(function (err, res) {
                debug('upload new-->', arguments);
                test.ifError(err);
                test.ok(res);
                test.equal(res.status, 200);
                test.equal(res.type, 'application/json');
                test.ok(/^[\w\-]+\.jpeg$/.test(res.body.id));
                test.equal(fs.statSync(res.body.file).size, fs.statSync(TEST_FILE).size);
                test.done();
            });
    },
    test_upload_ok_newWithPrefix: function (test) {
        superagent.agent().post(TEST_URL + '/new')
            .field('prefix', 'test')
            .attach('file', TEST_FILE, TEST_FILE)
            .end(function (err, res) {
                debug('upload_newWithPrefix-->', arguments);
                test.ifError(err);
                test.ok(res);
                test.equal(res.status, 200);
                test.equal(res.type, 'application/json');
                test.ok(/^test[\w\-]+\.jpeg$/.test(res.body.id));
                test.equal(utils.digestFile(res.body.file), utils.digestFile(TEST_FILE));
                test.done();
            });
    },
    test_upload_err_noFile: function (test) {
        superagent.agent().post(TEST_URL + '/' + TEST_ID)
            .end(function (err, res) {
                debug('upload -->', arguments);
                test.ifError(err);
                test.ok(res);
                test.equal(res.status, 400);
                test.equal(res.type, 'application/json');
                test.equal(res.body.error.status, 400);
                test.equal(res.body.error.message, 'required_param_file');
                test.done();
            });
    },
    test_uploadRaw_ok: function (test) {
        // curl -v -X PUT -H 'Content-Type:image/jpeg' http://localhost:3001/pictor/test.jpg --data-binary @tests/test.jpg
        var req = superagent.agent().put(TEST_URL + '/' + TEST_ID)
            .type('image/jpeg')
            .on('error', test.ifError)
            .on('response', function (res) {
                debug('upload put -->', arguments);
                test.ok(res);
                test.equal(res.status, 200);
                test.equal(res.type, 'application/json');
                test.equal(res.body.id, TEST_ID);
                test.equal(utils.digestFile(res.body.file), utils.digestFile(TEST_FILE));
            })
            .on('end', test.done);
        fs.createReadStream(TEST_FILE).pipe(req);
    },
    test_uploadUrl_ok: function (test) {
        var url = 'http://localhost:3001/favicon.ico';//octodex.github.com/images/original.png';
        superagent.agent().get(TEST_URL + '/upload')
            .query({id: TEST_ID, url: url})
            .end(function (err, res) {
                debug('upload url-->', arguments);
                test.ifError(err);
                test.ok(res);
                test.equal(res.status, 200);
                test.equal(res.type, 'application/json');
                test.equal(res.body.id, TEST_ID);
                test.done();
            });
    },
    test_uploadUrl_err_badHost: function (test) {
        var url = '__bad_host__';
        superagent.agent().get(TEST_URL + '/upload')
            .query({id: TEST_ID, url: url})
            .end(function (err, res) {
                debug('upload url bad host-->', arguments);
                test.ifError(err);
                test.ok(res);
                test.equal(res.status, 400);
                test.equal(res.type, 'application/json');
                test.equal(res.body.error.status, 400);
                test.equal(res.body.error.message, 'invalid_param_url');
                test.done();
            });
    },
    test_uploadUrl_err_badFile: function (test) {
        var url = TEST_URL + '/__bad_file__';
        superagent.agent().get(TEST_URL + '/upload')
            .query({id: TEST_ID, url: url})
            .end(function (err, res) {
                debug('upload url bad file-->', arguments);
                test.ifError(err);
                test.ok(res);
                test.equal(res.status, 400);
                test.equal(res.type, 'application/json');
                test.equal(res.body.error.status, 400);
                test.equal(res.body.error.message, 'invalid_param_url');
                test.done();
            })
    },
    //TODO: test_uploadMulti_ok: function (test) { }
    test_download: function (test) {
        superagent.agent().get(TEST_URL + '/download')
            .query({id: TEST_ID})
            .end(function (err, res) {
                debug('download -->', arguments);
                test.ifError(err);
                test.ok(res);
                test.equal(res.status, 200);
                //test.equal(res.status, 302);
                //test.equal(res.status, 307);
                test.equal(res.type, 'image/jpeg');
                test.done();
            });
    },
    test_download_err_notFound: function (test) {
        superagent.agent().get(TEST_URL + '/download')
            .query({id: '__not_found__'})
            .end(function (err, res) {
                debug('download_notFound -->', arguments);
                test.ifError(err);
                test.ok(res);
                test.equal(res.status, 404);
                test.equal(res.type, 'application/json');
                test.equal(res.body.error.status, 404);
                test.equal(res.body.error.message, 'not_found');
                test.done();
            });
    }
    //TODO: more test cases...
};