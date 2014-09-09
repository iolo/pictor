'use strict';

var
    fs = require('fs'),
    gm = require('gm'),
    Q = require('q'),
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
            return [Q.ninvoke(gm(src), 'identify'), Q.ninvoke(gm(dst), 'identify')];
        })
        .spread(function (si, di) {
            debug('convert->identify ok:', si, di);
            assert.equal(si.format, di.format);
            assert.equal(si.size.width, di.size.width);
            assert.equal(si.size.height, di.size.height);
            //assert.equal(fs.statSync(src).size <= fs.statSync(dst).size);
        })
        .fail(function (err) {
            debug('convert err:', err);
            assert.ifError(err);
        })
        .done(done);
}

describe('convert optimize', function () {
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
});
