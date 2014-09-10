'use strict';

/**
 * convert routes.
 *
 * @module pictor.routes.convert
 */

var
    _ = require('lodash'),
    pictor = require('../pictor'),
    base = require('./base'),
    debug = require('debug')('pictor:routes:convert'),
    DEBUG = !!debug.enabled;

/**
 * get all params for convert apis.
 *
 * XXX: is this secure??
 * i don't know which params are required for the converter
 * so, i'll pass all params available here...
 *
 * @param {*} req
 * @returns {*}
 * @private
 */
function _getConvertParams(req) {
    return _.extend({}, req.params, req.query, req.body);
}

/**
 * @apiDefineStructure convertRequest
 *
 * @apiParam {string} [converter='preset'] 'preset', 'convert', 'resize', 'thumbnail', 'rotate', 'crop', 'resizecrop', 'meta', 'exif', 'holder', ...
 * @apiParam {string} [id] input file identifier. required except 'holder' converter.
 * @apiParam {string} [format] output file format. if not specified, use source file format or converter default format.
 * @apiParam {number} [preset] preset name. used 'preset' converter only.
 * @apiParam {number} [w] width in pixels. used for 'resize', 'thumbnail', 'crop', holder' converters.
 * @apiParam {number} [h] height in pixels. used for 'resize', 'thumbnail', 'crop', holder' converters.
 * @apiParam {number} [x] distance in pixel from the left edge. used for 'crop', 'cropresize', 'resizecrop' converters.
 * @apiParam {number} [y] distance in pixels from the top edge. used for 'crop', 'cropresize', 'resizecorp' converters.
 * @apiParam {number} [nw] resize width before/after crop. used for 'cropresize' and 'resizecrop' converters.
 * @apiParam {number} [nh] resize height before/after crop. used for 'cropresize' and 'resizecrop' converters.
 * @apiParam {string} [flags] resize flags. used for 'resize' and 'cropresize' and 'resizecrop' converters.
 * @apiParam {number} [c] preferred number of colors in result image. used for 'resize', 'thumbnail' converters.
 * @apiParam {*} [*] and various converter specific params...
 */

/**
 * @api {post} /convert convert a file
 * @apiName convert
 * @apiGroup pictor_convert
 * @apiDescription convert a file and keep the result in cache for later use.
 *
 * @apiStructure convertRequest
 *
 * @apiExample resize 'foo.jpg' to 400x300 of png with curl:
 *    curl -X POST -d "converter=resize&id=foo.jpg&format=png&w=400&h=300" http://localhost:3001/api/v1/convert
 *
 * @apiSuccessStructure result
 * @apiErrorStructure error
 */
function convertFile(req, res) {
    // TODO: convert multiple files...
    // TODO: support chaining converters...

    var opts = _getConvertParams(req);
    DEBUG && debug('convertFile: opts=', opts);

    return base.sendResultDefer(req, res, pictor.convertFile(opts));
}

/**
 * @api {get} /convert convert and download a file
 * @apiName convertAndDownload
 * @apiGroup pictor_convert
 * @apiDescription convert a file and keep the result in cache for later use and download it.
 *
 * @apiStructure convertRequest
 *
 * @apiParam {string} [fallback] fallback file identifier or url served instead of error.
 *
 * @apiExample resize 'foo.jpg' to 100x100 of png and download it with curl:
 *    curl -X GET -o output.png http://localhost:3001/api/v1/convert?converter=resize&id=foo.jpg&format=png&w=100&h=100&fallback=http://link.to/some/image.png
 *
 * @apiSuccessStructure file
 * @apiErrorStructure error
 */
function convertAndDownloadFile(req, res) {
    var opts = _getConvertParams(req);
    DEBUG && debug('convertAndDownloadFile: opts=', opts);

    return base.sendFileDefer(req, res, pictor.convertFile(opts));
}

module.exports = {
    convertFile: convertFile,
    convertAndDownloadFile: convertAndDownloadFile
};
