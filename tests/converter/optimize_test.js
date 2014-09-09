'use strict';

var
    fs = require('fs'),
    gm = require('../../libs/converter/gm-q')(require('gm')),
    Converter = require('../../libs/converter/optimize'),
    assert = require('assert'),
    fixtures = require('../fixtures'),
    debug = require('debug')('test');

function testOptimize(src, dst, done) {
    var converter = new Converter({});
    var opts = {src: src, dst: dst};
    converter.convert(opts)
        .then(function (result) {
            debug('convert ok:', result);
            assert.ok(result);
            return [
                gm(src).identifyQ(),
                gm(dst).identifyQ()
            ];
        })
        .spread(function (si, di) {
            debug('convert->identify ok:', si, '-->', di);
            assert.equal(si.format, di.format);
            assert.deepEqual(si.size, di.size);
            //assert.equal(fs.statSync(src).size <= fs.statSync(dst).size);
        })
        .fail(function (err) {
            debug('convert err:', err);
            assert.ifError(err);
        })
        .done(done);
}

describe('optimize converter', function () {
    before(fixtures.setupConverterTestFiles);

    it('jpeg', function (done) {
        testOptimize(fixtures.src_jpg, fixtures.dst_jpg, done);
    });
    it('png', function (done) {
        testOptimize(fixtures.src_png, fixtures.dst_png, done);
    });
    it('gif', function (done) {
        testOptimize(fixtures.src_gif, fixtures.dst_gif, done);
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
