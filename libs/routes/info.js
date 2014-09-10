'use strict';

/**
 * informal routes.
 * @module pictor.routes.info
 */

var
    pictor = require('../pictor'),
    base = require('./base');

/**
 * @api {get} /info/converters get all available converters.
 * @apiName getConverters
 * @apiGroup pictor_info
 *
 * @apiErrorStructure error
 */
function getConverters(req, res) {
    return base.sendResult(req, res, pictor.getConverters());
}

/**
 * @api {get} /info/presets get all available presets.
 * @apiName getPresets
 * @apiGroup pictor_info
 *
 * @apiErrorStructure error
 */
function getPresets(req, res) {
    return base.sendResult(req, res, pictor.getPresets());
}

module.exports = {
    getConverters: getConverters,
    getPresets: getPresets
};
