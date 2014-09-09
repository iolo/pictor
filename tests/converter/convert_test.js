'use strict';

var
    fs = require('fs'),
    gm = require('../../libs/converter/gm-q')(require('gm')),
    Converter = require('../../libs/converter/convert'),
    assert = require('assert'),
    fixtures = require('../fixtures'),
    debug = require('debug')('test');

describe('convert converter', function () {
    before(fixtures.setupConverterTestFiles);

    it('convert', function (done) {
        var converter = new Converter({});
        var opts = {src: fixtures.src_jpg, dst: fixtures.dst_png};
        converter.convert(opts)
            .then(function (result) {
                debug('convert ok:', result);
                assert.ok(result);
                return [
                    gm(fixtures.src_jpg).identifyQ(),
                    gm(fixtures.dst_png).identifyQ()
                ];
            })
            .spread(function (si, di) {
                debug('convert-->identify:', si, '-->', di);
                assert.equal(si.format, 'JPEG');
                assert.equal(di.format, 'PNG');
                assert.deepEqual(si.size, di.size);
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
