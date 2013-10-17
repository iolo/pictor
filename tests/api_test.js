'use strict';

var
  superagent = require('superagent'),
  TEST_HOST = 'localhost',
  TEST_PORT = '3001',
  TEST_URL = 'http://' + TEST_HOST + ':' + TEST_PORT + '/pictor',
  TEST_ID = 'foo.jpg';


module.exports = {
  setUp: function (callback) {
    require('../app').start(callback, TEST_PORT, TEST_HOST);
  },
  tearDown: function (callback) {
    require('../app').stop(callback);
  },
  test_upload_ok: function (test) {
    superagent.agent().post(TEST_URL + '/' + TEST_ID)
      .field('id', 'foo.jpg')
      .attach('file', __dirname + '/test.jpg', 'foo.jpg')
      .end(function (err, res) {
        console.log('upload -->', arguments);
        test.ifError(err);
        test.ok(res);
        test.equal(res.status, 200);
        test.ok(/^application\/json/.test(res.headers['content-type']));
        test.done();
      });
  },
  test_upload_new_ok: function (test) {
    superagent.agent().post(TEST_URL + '/new')
      .attach('file', __dirname + '/test.jpg', 'foo.jpg')
      .end(function (err, res) {
        console.log('upload_new-->', arguments);
        test.ifError(err);
        test.ok(res);
        test.equal(res.status, 200);
        test.ok(/^application\/json/.test(res.headers['content-type']));
        test.ok(/^[\w\-]+\.jpeg$/.test(res.body.id));
        test.done();
      });
  },
  test_upload_newWithPrefix_ok: function (test) {
    superagent.agent().post(TEST_URL + '/new')
      .field('prefix', 'test')
      .attach('file', __dirname + '/test.jpg', 'foo.jpg')
      .end(function (err, res) {
        console.log('upload_newWithPrefix-->', arguments);
        test.ifError(err);
        test.ok(res);
        test.equal(res.status, 200);
        test.ok(/^application\/json/.test(res.headers['content-type']));
        test.ok(/^test[\w\-]+\.jpeg$/.test(res.body.id));
        test.done();
      });
  },
  test_upload_noFile_err: function (test) {
    superagent.agent().post(TEST_URL + '/' + TEST_ID)
      .end(function (err, res) {
        //console.log('upload -->', arguments);
        test.ifError(err);
        test.ok(res);
        test.equal(res.status, 400);
        test.ok(/^application\/json/.test(res.headers['content-type']));
        test.done();
      });
  },
  test_download: function (test) {
    superagent.agent().get(TEST_URL + '/' + TEST_ID)
      .end(function (err, res) {
        //console.log('download -->', arguments);
        test.ifError(err);
        test.ok(res);
        test.equal(res.status, 200);
        //test.equal(res.status, 302);
        //test.equal(res.status, 307);
        test.equal(res.headers['content-type'], 'image/jpeg');
        test.done();
      });
  },
  test_download_notFound: function (test) {
    superagent.agent().get(TEST_URL + '/__not_found__')
      .end(function (err, res) {
        //console.log('download_notFound -->', arguments);
        test.ifError(err);
        test.ok(res);
        test.equal(res.status, 404);
        test.ok(/^application\/json/.test(res.headers['content-type']));
        test.ok(res.body.error);
        test.done();
      });
  }
};