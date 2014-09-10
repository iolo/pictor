'use strict';

/**
 * unique file identifier using base36.
 *
 * @module pictor.id.base36
 */

var
    mime = require('mime'),
    ID_NEW = 'new',
    ID_REGEX = /^[\w\-]+(\.\w+)?/,
    DEF_PREFIX = '',
    DEF_SUFFIX = '';

/**
 * generate unique identifier.
 *
 * @param {string} prefix
 * @param {string} suffix
 * @returns {string}
 * @private
 */
function generateId(prefix, suffix) {
    return [
        prefix,
        Date.now().toString(36),
        '-',
        (Math.random() * 0x100000000).toString(36),
        suffix,
    ].join('');
}

/**
 * generate new file and unique file identifier.
 *
 * @param {string} [id='new'] identifier for the file
 * @param {string} [prefix=''] prefix for generated identifier(only if id is 'new')
 * @param {string} [type=''] mime type to determine file extension for for generated identifier(only if id is 'new')
 * @returns {string}
 */
function getFileId(id, prefix, type) {
    if (!id) {
        throw 'required_param_id';
    }
    if (id === ID_NEW) {
        return generateId(prefix || DEF_PREFIX, type ? '.' + mime.extension(type) : DEF_SUFFIX);
    }
    if (ID_REGEX.test(id)) {
        return id;
    }
    throw 'invalid_param_id';
}

module.exports = getFileId;