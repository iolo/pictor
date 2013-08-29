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
    var opts = { };
    test.equal(null, c.getExtension(opts));
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
