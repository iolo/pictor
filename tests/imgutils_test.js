'use strict';

var
  fs = require('fs'),
  imgutils = require('../libs/imgutils'),
  src_jpg = __dirname + '/test.jpg',
  src_png = __dirname + '/test.png',
  src_gif = __dirname + '/test.gif',
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
    imgutils.convert(src_jpg, dst_png)
      .then(function (result) {
        console.log('convert ok:', result);
        test.ok(result);
        return imgutils.format(dst_png);
      })
      .then(function (result) {
        console.log('convert->format ok:', result);
        test.ok(result, 'PNG');
      })
      .fail(function (err) {
        console.log('convert err:', err);
        test.ifError(err);
      })
      .done(test.done);
  },
  test_format: function (test) {
    imgutils.format(src_jpg)
      .then(function (result) {
        console.log('format ok:', result);
        test.equal('JPEG', result);
        return imgutils.format(src_png);
      })
      .then(function (result) {
        console.log('format ok:', result);
        test.equal('PNG', result);
        return imgutils.format(src_gif);
      })
      .then(function (result) {
        console.log('format ok:', result);
        test.equal('GIF', result);
      })
      .fail(function (err) {
        console.log('format err:', err);
        test.ifError(err);
      })
      .done(test.done);
  },
  test_size: function (test) {
    imgutils.size(src_jpg)
      .then(function (result) {
        console.log('size ok:', result);
        test.equal(result.width, 1280);
        test.equal(result.height, 960);
        return imgutils.size(src_png);
      })
      .then(function (result) {
        console.log('size ok:', result);
        test.equal(result.width, 800);
        test.equal(result.height, 600);
        return imgutils.size(src_gif);
      })
      .then(function (result) {
        console.log('size ok:', result);
        test.equal(result.width, 60);
        test.equal(result.height, 132);
      })
      .fail(function (err) {
        console.log('size err:', err);
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
  },
  test_holder: function (test) {
    imgutils.holder(dst_jpg, 400, 300)
      .then(function (result) {
        console.log('holder ok:', result);
        test.ok(result);
        return imgutils.meta(dst_jpg);
      })
      .then(function (result) {
        console.log('holder->meta ok:', result);
        test.ok(result);
        test.equal(result.format, 'JPEG');
        test.equal(result.width, 400);
        test.equal(result.height, 300);
      })
      .fail(function (err) {
        console.log('holder err:', err);
        test.ifError(err);
      })
      .done(test.done);
  },
  test_optimize_jpeg: function (test) {
    imgutils.optimize(src_jpg, dst_jpg)
      .then(function (result) {
        console.log('optimize_jpeg ok:', result);
        test.ok(result);
        return [imgutils.meta(src_jpg), imgutils.meta(dst_jpg)];
      })
      .spread(function (result1, result2) {
        console.log('optimize_jpeg->meta ok:', result1, result2);
        test.ok(result1.format, 'JPEG');
        test.ok(result2.format, 'JPEG');
      })
      .fail(function (err) {
        console.log('optimize_jpeg err:', err);
        test.ifError(err);
      })
      .done(test.done);
  },
  test_optimize_png: function (test) {
    imgutils.optimize(src_png, dst_png)
      .then(function (result) {
        console.log('optimize_png ok:', result);
        test.ok(result);
        return [imgutils.meta(src_png), imgutils.meta(dst_png)];
      })
      .spread(function (result1, result2) {
        console.log('optimize_png->meta ok:', result1, result2);
        test.ok(result1.format, 'PNG');
        test.ok(result2.format, 'PNG');
      })
      .fail(function (err) {
        console.log('optimize_png err:', err);
        test.ifError(err);
      })
      .done(test.done);
  },
  test_optimize_gif: function (test) {
    imgutils.optimize(src_gif, dst_gif)
      .then(function (result) {
        console.log('optimize_gif ok:', result);
        test.ok(result);
        return [imgutils.meta(src_gif), imgutils.meta(dst_gif)];
      })
      .spread(function (result1, result2) {
        console.log('optimize_gif->meta ok:', result1, result2);
        test.ok(result1.format, 'GIF');
        test.ok(result2.format, 'GIF');
      })
      .fail(function (err) {
        console.log('optimize_gif err:', err);
        test.ifError(err);
      })
      .done(test.done);
  }
};
