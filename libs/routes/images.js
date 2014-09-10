'use strict';

/**
 * convenient aliases of convertAndDownload api using specific converters
 *
 * XXX: this code depends on implementation of built-in converters.
 *
 * @module pictor.routes.images
 */

var
    convertAndDownloadFile = require('./convert').convertAndDownloadFile;

/**
 * @api {get} /holder/{width}x{height}.{format} download holder image.
 * @apiName downloadHolderImage
 * @apiGroup pictor_images
 * @apiDescription convenient alias of `convertAndDownload` api using `holder` converter.
 *
 * @apiParam {number} w width in pixels
 * @apiParam {number} h height in pixels
 * @apiParam {string} [format] 'png', 'jpg', 'jpeg' or 'gif'. use source format by default.
 *
 * @apiExample create 400x300 holder of png and download it with curl:
 *    curl -X GET -o output.png http://localhost:3001/api/v1/holder/400x300.png
 *
 * @apiSuccessStructure file
 * @apiErrorStructure error
 */
function downloadHolderImage(req, res) {
    req.query.converter = 'holder';
    req.query.w = req.params[0];
    req.query.h = req.params[1];
    req.query.format = req.params[3];
    return convertAndDownloadFile(req, res);
}
downloadHolderImage.METHOD = 'get';
downloadHolderImage.PATH = new RegExp('/holder/(\\d+)x(\\d+)(.(\\w+))?');

/**
 * @api {get} /resize/{id}/{width}x{height}{flags}.{format} download resize image.
 * @apiName downloadResizeImage
 * @apiGroup pictor_images
 * @apiDescription convenient alias of `convertAndDownload` api using `resize` converter.
 *
 * @apiParam {number} w width in pixels
 * @apiParam {number} h height in pixels
 * @apiParam {string} [flags] resizing flags. '!' for force. '%' for percent. '^' for fill area, '<' for enlarge, '>' shrink, '@' for pixels
 * @apiParam {string} [format] 'png', 'jpg', 'jpeg' or 'gif'. use source format by default.
 *
 * @apiExample resize foo.jpg to 400x300(ignore aspect ratio) of png and download it with curl:
 *    curl -X GET -o output.png http://localhost:3001/api/v1/resize/foo.jpg/400x300!.png
 *
 * @apiSuccessStructure file
 * @apiErrorStructure error
 */
function downloadResizeImage(req, res) {
    req.query.converter = 'resize';
    req.query.id = req.params[0];
    req.query.w = req.params[1];
    req.query.h = req.params[2];
    req.query.flags = req.params[3];
    req.query.format = req.params[5];
    return convertAndDownloadFile(req, res);
}
downloadResizeImage.METHOD = 'get';
downloadResizeImage.PATH = new RegExp('/resize/([\\w\\-\\.]+)/(\\d+)x(\\d+)([!%^<>@]?)(.(\\w+))?');

/**
 * @api {get} /thumbnail/{id}/{w}x{h}.{format} download thumbnail image.
 * @apiName downloadThumbnailImage
 * @apiGroup pictor_images
 * @apiDescription convenient alias of `convertAndDownload` api using `thumbnail` converter.
 *
 * This will keep aspect-ratio and auto-rotate by exif orientation.
 *
 * @apiParam {number} w width in pixels
 * @apiParam {number} h height in pixels
 * @apiParam {string} [format] 'png', 'jpg', 'jpeg' or 'gif'. use source format by default.
 *
 * @apiExample thumbnail foo.jpg to 400x300 of png and download it with curl:
 *    curl -X GET -o output.png http://localhost:3001/api/v1/thumbnail/foo.jpg/400x300.png
 *
 * @apiSuccessStructure file
 * @apiErrorStructure error
 */
function downloadThumbnailImage(req, res) {
    req.query.converter = 'thumbnail';
    req.query.id = req.params[0];
    req.query.w = req.params[1];
    req.query.h = req.params[2];
    req.query.format = req.params[4];
    return convertAndDownloadFile(req, res);
}
downloadThumbnailImage.METHOD = 'get';
downloadThumbnailImage.PATH = new RegExp('/thumbnail/([\\w\\-\\.]+)/(\\d+)x(\\d+)(.(\\w+))?');

/**
 * @api {get} /crop/{id}/{w}x{h}+{x}+{y}.{format} download cropped image.
 * @apiName downloadCropImage
 * @apiGroup pictor_images
 * @apiDescription convenient alias of `convertAndDownload` api using `crop` converter.
 *
 * @apiParam {number} w width in pixels
 * @apiParam {number} h height in pixels
 * @apiParam {number} x distance in pixel from the left edge
 * @apiParam {number} y distance in pixels from the top edge
 * @apiParam {string} [format] 'png', 'jpg', 'jpeg' or 'gif'. use source format by default.
 *
 * @apiExample crop foo.jpg to rectangle(400x300+200+100) of png and download it with curl:
 *    curl -X GET -o output.png http://localhost:3001/api/v1/crop/foo.jpg/400x300+200+100.png
 *
 * @apiSuccessStructure file
 * @apiErrorStructure error
 */
function downloadCropImage(req, res) {
    req.query.converter = 'crop';
    req.query.id = req.params[0];
    req.query.w = req.params[1];
    req.query.h = req.params[2];
    req.query.x = req.params[3];
    req.query.y = req.params[4];
    req.query.format = req.params[6];
    return convertAndDownloadFile(req, res);
}
downloadCropImage.METHOD = 'get';
downloadCropImage.PATH = new RegExp('/crop/([\\w\\-\\.]+)/(\\d+)x(\\d+)\\+(\\d+)\\+(\\d+)(.(\\w+))?');

/**
 * @api {get} /rotate/{id}/{degree}.{format} download rotated image.
 * @apiName downloadRotateImage
 * @apiGroup pictor_images
 * @apiDescription convenient alias of `convertAndDownload` api using `rotate` converter.
 *
 * @apiParam {number} clockwise degree amount of rotate
 * @apiParam {string} [format] 'png', 'jpg', 'jpeg' or 'gif'. use source format by default.
 *
 * @apiExample crop foo.jpg to 90deg(clockwise) rotated png and download it with curl:
 *    curl -X GET -o output.png http://localhost:3001/api/v1/rotate/foo.jpg/90.png
 *
 * @apiSuccessStructure file
 * @apiErrorStructure error
 */
function downloadRotateImage(req, res) {
    req.query.converter = 'rotate';
    req.query.id = req.params[0];
    req.query.degree = req.params[1];
    req.query.format = req.params[3];
    return convertAndDownloadFile(req, res);
}
downloadRotateImage.METHOD = 'get';
downloadRotateImage.PATH = new RegExp('/rotate/([\\w\\-\\.]+)/(\\d+)(.(\\w+))?');

/**
 * @api {get} /resizecrop/{id}/{nw}x{nh}/{w}x{h}+{x}+{y}.{format} download crop image.
 * @apiName downloadResizeCropImage
 * @apiGroup pictor_images
 * @apiDescription convenient alias of `convertAndDownload` api using `resizecrop` converter.
 *
 * @apiParam {number} [nw] resize width before crop.
 * @apiParam {number} [nh] resize height before crop.
 * @apiParam {number} w width in pixels
 * @apiParam {number} h height in pixels
 * @apiParam {number} x distance in pixel from the left edge
 * @apiParam {number} y distance in pixels from the top edge
 * @apiParam {string} [format] 'png', 'jpg', 'jpeg' or 'gif'. use source format by default.
 *
 * @apiExample resize foo.jpg to 1280x720 and crop to rectangle(400x300+200+100) of png and download it with curl:
 *    curl -X GET -o output.png http://localhost:3001/api/v1/resizecrop/foo.jpg/1280x720/400x300+200+100.png
 *
 * @apiSuccessStructure file
 * @apiErrorStructure error
 */
function downloadResizeCropImage(req, res) {
    req.query.converter = 'resizecrop';
    req.query.id = req.params[0];
    req.query.nw = req.params[1];
    req.query.nh = req.params[2];
    req.query.w = req.params[3];
    req.query.h = req.params[4];
    req.query.x = req.params[5];
    req.query.y = req.params[6];
    req.query.format = req.params[7];
    return convertAndDownloadFile(req, res);
}
downloadResizeCropImage.METHOD = 'get';
downloadResizeCropImage.PATH = new RegExp('/resizecrop/([\\w\\-\\.]+)/(\\d+)x(\\d+)/(\\d+)x(\\d+)\\+(\\d+)\\+(\\d+)(.(\\w+))?');

/**
 * @api {get} /cropresize/{id}/{w}x{h}+{x}+{y}/{nw}x{nh}.{format} download crop image.
 * @apiName downloadCropResizeImage
 * @apiGroup pictor_images
 * @apiDescription convenient alias of `convertAndDownload` api using `cropresize` converter.
 *
 * @apiParam {number} w width in pixels
 * @apiParam {number} h height in pixels
 * @apiParam {number} x distance in pixel from the left edge
 * @apiParam {number} y distance in pixels from the top edge
 * @apiParam {number} [nw] resize width after crop.
 * @apiParam {number} [nh] resize height after crop.
 * @apiParam {string} [format] 'png', 'jpg', 'jpeg' or 'gif'. use source format by default.
 *
 * @apiExample crop foo.jpg to rectangle(400x300+200+100) and resize to 1280x720 of png and download it with curl:
 *    curl -X GET -o output.png http://localhost:3001/api/v1/cropresize/foo.jpg/400x300+200+100/1280x720.png
 *
 * @apiSuccessStructure file
 * @apiErrorStructure error
 */
function downloadCropResizeImage(req, res) {
    req.query.converter = 'cropresize';
    req.query.id = req.params[0];
    req.query.w = req.params[1];
    req.query.h = req.params[2];
    req.query.x = req.params[3];
    req.query.y = req.params[4];
    req.query.nw = req.params[5];
    req.query.nh = req.params[6];
    req.query.format = req.params[7];
    return convertAndDownloadFile(req, res);
}
downloadCropResizeImage.METHOD = 'get';
downloadCropResizeImage.PATH = new RegExp('/cropresize/([\\w\\-\\.]+)/(\\d+)x(\\d+)\\+(\\d+)\\+(\\d+)/(\\d+)x(\\d+)(.(\\w+))?');

/**
 * @api {get} /preset/{id}/{preset}.{format} download preset image.
 * @apiName downloadPresetImage
 * @apiGroup pictor_images
 * @apiDescription convenient alias of `convertAndDownload` api using `preset` converter.
 *
 * @apiParam {string} id source file identifier
 * @apiParam {string} preset preset name. 'xxs', 'xs', 's', 'm', 'l', 'xl', 'xxl', 'xxs@2x', 'xs@2x', 's@2x', 'm@2x', 'l@2x', 'xl@2x', 'xxl@2x', ...
 * @apiParam {string} [format] 'png', 'jpg', 'jpeg' or 'gif'. use source format by default.
 *
 * @apiExample preset to xxl@2x(thumbnail to 512x512) of png and download it with curl:
 *    curl -X GET -o output.png http://localhost:3001/api/v1/preset/foo.jpg/xxl@2x.png
 *
 * @apiSuccessStructure file
 * @apiErrorStructure error
 */
function downloadPresetImage(req, res) {
    req.query.converter = 'preset';
    req.query.id = req.params[0];
    req.query.preset = req.params[1];
    req.query.format = req.params[3];
    return convertAndDownloadFile(req, res);
}
downloadPresetImage.METHOD = 'get';
downloadPresetImage.PATH = new RegExp('/preset/([\\w\\-\\.]+)/([\\w@]+)(.(\\w+))?');

module.exports = {
    downloadHolderImage: downloadHolderImage,
    downloadResizeImage: downloadResizeImage,
    downloadThumbnailImage: downloadThumbnailImage,
    downloadCropImage: downloadCropImage,
    downloadRotateImage: downloadRotateImage,
    downloadResizeCropImage: downloadResizeCropImage,
    downloadCropResizeImage: downloadCropResizeImage,
    downloadPresetImage: downloadPresetImage
};