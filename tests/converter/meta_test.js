'use strict';

var
    fs = require('fs'),
    gm = require('gm'),
    Q = require('q'),
    Converter = require('../../libs/converter/meta'),
    assert = require('assert'),
    fixtures = require('../fixtures'),
    debug = require('debug')('test');

function testMeta(src, dst, done) {
    var converter = new Converter({});
    var opts = {src: src, dst: dst};
    converter.convert(opts)
        .then(function (result) {
            debug('convert ok:', result);
            //assert.ok(result);
            return Q.all([
                Q.ninvoke(gm(src), 'identify'),
                JSON.parse(fs.readFileSync(dst, 'utf8'))
            ]);
        })
        .spread(function (si, di) {
            debug('convert->identify ok:', si);
            debug('*************convert->identify ok:', di);
            assert.equal(si.format, di.format);
            assert.equal(si.size.width, di.width);
            assert.equal(si.size.height, di.height);
            assert.equal(si.depth, di.depth);
            assert.equal(si.Filesize, di.size);
            //assert.equal(si.colors, di.colors);
        })
        .fail(function (err) {
            debug('convert err:', err);
            assert.ifError(err);
        })
        .done(done);
}

describe('convert meta', function () {
    before(fixtures.setupConverterTestFiles);

    it('jpeg', function (done) {
        testMeta(fixtures.src_jpg, fixtures.dst_jpg + '.json', done);
    });
    it('png', function (done) {
        testMeta(fixtures.src_png, fixtures.dst_png + '.json', done);
    });
    it('gif', function (done) {
        testMeta(fixtures.src_gif + '[0]', fixtures.dst_gif + 'json', done); // [0] for first frame only
    });
});
