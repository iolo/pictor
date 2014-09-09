'use strict';

var
    fs = require('fs'),
    gm = require('../../libs/converter/gm-q')(require('gm')),
    Converter = require('../../libs/converter/holder'),
    assert = require('assert'),
    fixtures = require('../fixtures'),
    debug = require('debug')('test');

describe('holder converter', function () {
    before(fixtures.setupConverterTestFiles);

    it('convert', function (done) {
        var converter = new Converter({});
        var opts = {dst: fixtures.dst_png, w: 123, h: 456};
        converter.convert(opts)
            .then(function (result) {
                debug('convert ok:', result);
                assert.ok(result);
                return gm(fixtures.dst_png).identifyQ();
            })
            .then(function (result) {
                debug('convert->identify ok:', result);
                assert.equal(result.format, 'PNG');
                assert.equal(result.size.width, 123);
                assert.equal(result.size.height, 456);
            })
            .fail(function (err) {
                debug('convert err:', err);
                assert.ifError(err);
            })
            .done(done);
    });
});
