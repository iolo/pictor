'use strict';

var
    Converter = require('../../libs/converter/converter'),
    assert = require('assert'),
    debug = require('debug')('test');

describe('converter', function () {
    it('getVariation', function () {
        var c = new Converter({});
        var opts = { converter: 'test', foo: 'bar', bar: 'baz', baz: 'qux'};
        assert.equal('converter_test_foo_bar_bar_baz_baz_qux', c.getVariation(opts));
    });
    it('getExtension', function () {
        var c = new Converter({});
        assert.equal('jpg', c.getExtension({format: 'jpg'}));
        assert.equal('jpg', c.getExtension({src: 'test.jpg'}));
        assert.equal('jpg', c.getExtension({format: 'jpg', src: 'test.png'}));
        assert.equal('bin', c.getExtension({src: 'test'}));
        assert.equal('bin', c.getExtension({}));

        var c2 = new Converter({format: 'gif'});
        assert.equal('jpg', c2.getExtension({format: 'jpg'}));
        assert.equal('jpg', c2.getExtension({src: 'test.jpg'}));
        assert.equal('jpg', c2.getExtension({format: 'jpg', src: 'test.png'}));
        assert.equal('gif', c2.getExtension({src: 'test'}));
        assert.equal('gif', c2.getExtension({}));
    });
    it('convert', function (done) {
        var c = new Converter({});
        c.convert({})
            .then(function (result) {
                debug('convert ok', result);
                assert.fail();
            })
            .fail(function (err) {
                debug('convert err', err);
                assert.ok(err);
            })
            .done(done);
    });
});
