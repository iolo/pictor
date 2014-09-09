'use strict';

var
    fs = require('fs'),
    gm = require('gm'),
    Q = require('q'),
    Converter = require('../../libs/converter/crop'),
    assert = require('assert'),
    fixtures = require('../fixtures'),
    debug = require('debug')('test');

describe('convert converter', function () {
    before(fixtures.setupConverterTestFiles);

    it('crop', function (done) {
        var converter = new Converter({});
        var opts = {src: fixtures.src_jpg, dst: fixtures.dst_png, x: 10, y: 20, w: 30, h: 40};
        converter.convert(opts)
            .then(function (result) {
                debug('convert ok:', result);
                assert.ok(result);
                return Q.ninvoke(gm(fixtures.dst_png), 'identify');
            })
            .then(function (result) {
                debug('convert->identify ok:', result);
                assert.equal(result.format, 'PNG');
                assert.equal(result.size.width, 30);
                assert.equal(result.size.height, 40);
            })
            .fail(function (err) {
                debug('convert err:', err);
                assert.ifError(err);
            })
            .done(done);
    });

    it('NOT convert not exist', function (done) {
        var converter = new Converter({});
        var opts = {src: fixtures.not_exist_file, dst: fixtures.dst_jpg};
        converter.convert(opts)
            .then(function (result) {
                debug('convert ok:', result);
                assert.fail();
            })
            .fail(function (err) {
                debug('convert err:', err);
                assert.ok(err);
                //assert.ok(err instanceof ConverterError);
                //assert.ok(err.status, 404);
            })
            .done(done);
    });
});
