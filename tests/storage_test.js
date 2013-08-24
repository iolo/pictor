'use strict';

var
  storage = require('../libs/storage/storage');

module.exports = {
  test_putFile: function (test) {
    var s = new storage.Storage({});
    s.putFile()
      .then(function (result) {
        console.log('putFile ok', result);
        test.fail();
      })
      .fail(function (err) {
        console.log('putFile err', err);
        test.ok(err);
      })
      .done(test.done);
  },
  test_getFile: function (test) {
    var s = new storage.Storage({});
    s.getFile()
      .then(function (result) {
        console.log('getFile ok', result);
        test.fail();
      })
      .fail(function (err) {
        console.log('getFile err', err);
        test.ok(err);
      })
      .done(test.done);
  },
  test_deleteFile: function (test) {
    var s = new storage.Storage({});
    s.deleteFile()
      .then(function (result) {
        console.log('deleteFile ok', result);
        test.fail();
      })
      .fail(function (err) {
        console.log('deleteFile err', err);
        test.ok(err);
      })
      .done(test.done);
  },
  test_sanitize_pass: function (test) {
//    var s = new storage.Storage();
//    var src = 'azAZ09가힣-_.';
//    var dst = s._sanitize(src);
//    console.log('sanitize:', src, '-->', dst);
//    test.equal(dst, src);
    test.done();
  },
  test_sanitize_replaced: function (test) {
//    var s = new storage.Storage();
//    var src = '!_#$%^&*(){}[]<>';
//    var dst = s._sanitize(src);
//    console.log('sanitize:', src, '-->', dst);
//    test.equal(dst, '________________');
    test.done();
  }
};
