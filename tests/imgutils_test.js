'use strict';

var
  fs = require('fs'),
  imgutils = require('../libs/imgutils'),
  src_jpg = __dirname + '/src.jpg',
  src_png = __dirname + '/src.png',
  src_gif = __dirname + '/src.gif',
  dst_jpg = '/tmp/pictor_imgutils_test_dst.jpg',
  dst_png = '/tmp/pictor_imgutils_test_dst.png',
  dst_gif = '/tmp/pictor_imgutils_test_dst.gif';

module.exports = {
  setUp: function (callback) {
    fs.unlink(dst_jpg, function () {
      fs.unlink(dst_png, function () {
        fs.unlink(dst_gif, function () {
          callback();
        });
      });
    });
  },
  test_convert: function (test) {
    var opts = '';
    imgutils.convert(src_jpg, dst_jpg, opts)
      .then(function (result) {
        console.log('convert ok:', result);
        test.ok(result);
        test.ok(fs.existsSync(dst_jpg));
      })
      .fail(function (err) {
        console.log('convert err:', err);
        test.ifError(err);
      })
      .done(test.done);
  },
  /*
   test_holder: function (test) {
   var opts = '';
   imgutils.createHolderImage(dst1, opts)
   .then(function (result) {
   console.log('holder ok:', result);
   test.ok(result);
   })
   .fail(function (err) {
   console.log('holder err:', err);
   test.ifError(err);
   })
   .done(test.done);
   },
   */
  test_identify: function (test) {
    imgutils.identify(src_jpg)
      .then(function (result) {
        console.log('identify ok:', result);
        test.ok(result);
      })
      .fail(function (err) {
        console.log('identify err:', err);
        test.ifError(err);
      })
      .done(test.done);
  },
  test_meta: function (test) {
    imgutils.meta(src_jpg)
      .then(function (result) {
        console.log('meta ok:', result);
        test.ok(result);
      })
      .fail(function (err) {
        console.log('meta err:', err);
        test.ifError(err);
      })
      .done(test.done);
  },
  test_exif: function (test) {
    imgutils.exif(src_jpg)
      .then(function (result) {
        console.log('exif ok:', result);
        test.ok(result);
      })
      .fail(function (err) {
        console.log('exif err:', err);
        test.ifError(err);
      })
      .done(test.done);
  }
};
