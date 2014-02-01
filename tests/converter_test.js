'use strict';

var
    converter = require('../libs/converter/converter');

module.exports = {
    test_getVariation: function (test) {
        var c = new converter.Converter({});
        var opts = { converter: 'test', foo: 'bar', bar: 'baz', baz: 'qux'};
        test.equal('converter_test_foo_bar_bar_baz_baz_qux', c.getVariation(opts));
        test.done();
    },
    test_getExtension: function (test) {
        var c = new converter.Converter({});
        test.equal('jpg', c.getExtension({format: 'jpg'}));
        test.equal('jpg', c.getExtension({src: 'test.jpg'}));
        test.equal('jpg', c.getExtension({format: 'jpg', src: 'test.png'}));
        test.equal('bin', c.getExtension({src: 'test'}));
        test.equal('bin', c.getExtension({}));

        var c2 = new converter.Converter({format: 'gif'});
        test.equal('jpg', c2.getExtension({format: 'jpg'}));
        test.equal('jpg', c2.getExtension({src: 'test.jpg'}));
        test.equal('jpg', c2.getExtension({format: 'jpg', src: 'test.png'}));
        test.equal('gif', c2.getExtension({src: 'test'}));
        test.equal('gif', c2.getExtension({}));

        test.done();
    },
    test_convert: function (test) {
        var c = new converter.Converter({});
        c.convert({})
            .then(function (result) {
                console.log('convert ok', result);
                test.fail();
            })
            .fail(function (err) {
                console.log('convert err', err);
                test.ok(err);
            })
            .done(test.done);
    }
};
