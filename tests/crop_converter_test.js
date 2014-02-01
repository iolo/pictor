'use strict';

var
    fs = require('fs'),
    gm = require('gm'),
    Q = require('q'),
    Converter = require('../libs/converter/crop'),
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
        var converter = new Converter({});
        var opts = {src: src_jpg, dst: dst_png, x: 10, y: 20, w: 30, h: 40};
        converter.convert(opts)
            .then(function (result) {
                console.log('convert ok:', result);
                test.ok(result);
                return Q.ninvoke(gm(dst_png), 'identify');
            })
            .then(function (result) {
                console.log('convert->identify ok:', result);
                test.equals(result.format, 'PNG');
                test.equals(result.size.width, 30);
                test.equals(result.size.height, 40);
            })
            .fail(function (err) {
                console.log('convert err:', err);
                test.ifError(err);
            })
            .done(test.done);
    }
}
