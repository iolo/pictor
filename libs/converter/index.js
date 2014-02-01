'use strict';

var
    converters = {
        'convert': require('./convert'),
        'resize': require('./resize'),
        'thumbnail': require('./thumbnail'),
        'crop': require('./crop'),
        'cropresize': require('./cropresize'),
        'resizecrop': require('./resizecrop'),
        'watermark': require('./watermark'),
        'optimize': require('./optimize'),
        'meta': require('./meta'),
        'exif': require('./exif'),
        'holder': require('./holder')
    };

/**
 * register a converter.
 *
 * @param {string} name
 * @param {function} converter
 */
function registerConverter(name, converter) {
    converters[name] = converter;
}

/**
 * create a storage converter.
 *
 * @param {string} name
 * @param {object} config
 * @returns {object} a converter instance or `null`
 */
function createConverter(name, config) {
    var ConverterCtor = converters[name];
    return ConverterCtor ? new ConverterCtor(config) : null;
}

module.exports = {
    registerConverter: registerConverter,
    createConverter: createConverter
};
