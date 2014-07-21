'use strict';

var PICTOR_HTTP_HOST = process.env.PICTOR_HTTP_HOST || '127.0.0.1';
var PICTOR_HTTP_PORT = process.env.PICTOR_HTTP_PORT || 3001;
var PICTOR_TEMP_DIR = process.env.PICTOR_TEMP_DIR || process.env.TMPDIR || '/tmp/pictor/temp';
var PICTOR_UPLOAD_DIR = process.env.PICTOR_UPLOAD_DIR || PICTOR_TEMP_DIR;

module.exports = {
    http: {
        host: PICTOR_HTTP_HOST,
        port: PICTOR_HTTP_PORT,
        // see express-toybox/common.js#configureMiddlewares()
        json: {},
        urlencoded: {},
        multipart: {
            uploadDir: PICTOR_UPLOAD_DIR,
            keepExtensions: false,
            maxFields: 10 * 1024 * 1024
        },
//        errors: {
//            404: {},
//            500: {}
//        },
        root: 'build/app' // build output of static web resources
    },
    pictor: {
        // see development/staging/production.js
//        data: ...
//        cache: ...
        // see libs/converter
        converters: {
            convert: {},
            resize: {},
            thumbnail: {},
            crop: {},
            cropresize: {},
            resizecrop: {},
            watermark: {},
            optimize: {},
            meta: {},
            exif: {},
            holder: {
                font: '/Library/Fonts/Impact.ttf' // for mac
                //font: '/usr/share/fonts/truetype/ttf-dejavu/dejavu-sans.ttf' // for linux
                //font: '/windows/fonts/impact.ttf' // for windows
            }
        },
        tempDir: PICTOR_TEMP_DIR,
    },
    api: {
        root: '/pictor', // to mount as express sub-app
        prefix: '', // to embed in express app
        redirect: 302 //false,301,302,307
    }
};
