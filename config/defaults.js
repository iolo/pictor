'use strict';

var PICTOR_TEMP_DIR = process.env.PICTOR_TEMP_DIR || process.env.TMPDIR || '/tmp/pictor/temp';
var PICTOR_UPLOAD_DIR = process.env.PICTOR_UPLOAD_DIR || PICTOR_TEMP_DIR;
var PICTOR_GM_FONT = process.env.PICTOR_GM_FONT;
if (!PICTOR_GM_FONT) {
    switch (process.platform) {
        case 'darwin':
            PICTOR_GM_FONT = '/Library/Fonts/Arial.ttf';
            break;
        case 'linux':
            PICTOR_GM_FONT = '/usr/share/fonts/truetype/ttf-dejavu/dejavu-sans.ttf';
            break;
        case 'win32':
            PICTOR_GM_FONT = '/windows/fonts/arial.ttf';
            break;
    }
}

module.exports = {
    http: {
        host: 'localhost', // override with `--host`
        port: 3001, // override with `--port`
        prefix: '/api/v1',
        redirect: 302, //false,301,302,307
        // see express-toybox/common.js#configureMiddlewares()
        middlewares: {
            json: {},
            urlencoded: {},
            multipart: {
                uploadDir: PICTOR_UPLOAD_DIR,
                keepExtensions: false,
                maxFields: 10 * 1024 * 1024
            }
        },
        // see express-toybox/common.js#configureRoutes()
        routes: {
            root: 'build/public', // build with `grunt build`
            statics: {
                '/bower_components': 'bower_components' // download with 'bower install'
            }
        }
    },
    // see development/staging/production.js
    // data: ...
    // cache: ...
    // see libs/converter
    converters: {
        convert: {},
        resize: {},
        thumbnail: {},
        rotate: {},
        crop: {},
        cropresize: {},
        resizecrop: {},
        optimize: {},
        meta: {},
        exif: {},
        watermark: {
            font: PICTOR_GM_FONT
        },
        holder: {
            font: PICTOR_GM_FONT
        }
    },
    tempDir: PICTOR_TEMP_DIR
};
