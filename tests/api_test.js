'use strict';

var
  fs = require('fs'),
  superagent = require('superagent'),
  TEST_HOST = 'localhost',
  TEST_PORT = '3001',
  TEST_URL = 'http://' + TEST_HOST + ':' + TEST_PORT + '/pictor',
  TEST_ID = 'foo.jpg',
  TEST_FILE = __dirname + '/test.jpg';

function _digestFile(file) {
  return require('crypto').createHash('md5').update(fs.readFileSync(file)).digest('hex');
}

module.exports = {
  setUp: function (callback) {
    require('../app').start(callback, TEST_PORT, TEST_HOST);
  },
  tearDown: function (callback) {
    require('../app').stop(callback);
  },
  test_upload_ok: function (test) {
    superagent.agent().post(TEST_URL + '/' + TEST_ID)
      .attach('file', TEST_FILE, TEST_FILE)
      .end(function (err, res) {
        //console.log('upload -->', arguments, res.body);
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
        //console.log('upload new-->', arguments);
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
        //console.log('upload_newWithPrefix-->', arguments);
        test.ifError(err);
        test.ok(res);
        test.equal(res.status, 200);
        test.equal(res.type, 'application/json');
        test.ok(/^test[\w\-]+\.jpeg$/.test(res.body.id));
        test.equal(_digestFile(res.body.file), _digestFile(TEST_FILE));
        test.done();
      });
  },
  test_upload_err_noFile: function (test) {
    superagent.agent().post(TEST_URL + '/' + TEST_ID)
      .end(function (err, res) {
        //console.log('upload -->', arguments);
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
        console.log('upload put -->', arguments);
        test.ok(res);
        test.equal(res.status, 200);
        test.equal(res.type, 'application/json');
        test.equal(res.body.id, TEST_ID);
        test.equal(_digestFile(res.body.file), _digestFile(TEST_FILE));
      })
      .on('end', test.done);
    fs.createReadStream(TEST_FILE).pipe(req);
  },
  test_uploadUrl_ok: function (test) {
    var url = 'http://localhost:3001/favicon.ico';//octodex.github.com/images/original.png';
    superagent.agent().get(TEST_URL + '/upload')
      .query({id: TEST_ID, url: url})
      .end(function (err, res) {
        //console.log('upload url-->', arguments);
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
        //console.log('upload url bad host-->', arguments);
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
        //console.log('upload url bad file-->', arguments);
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
        //console.log('download -->', arguments);
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
        //console.log('download_notFound -->', arguments);
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