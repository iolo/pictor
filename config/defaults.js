'use strict';

var PICTOR_TEMP_DIR = process.env.PICTOR_TEMP_DIR || process.env.TMPDIR || '/tmp/pictor/temp';
var PICTOR_UPLOAD_DIR = process.env.PICTOR_UPLOAD_DIR || PICTOR_TEMP_DIR;

module.exports = {
    http: {
        host: 'localhost',
        port: 3001,
        // see express-toybox/common.js#configureMiddlewares()
        middlewares: {
        },
        // see express-toybox/common.js#configureRoutes()
        routes: {
            root: 'build/app' // build output of static web resources
//            errors: {
//                404: {},
//                500: {}
//            }
        }
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
            rotate: {},
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
        tempDir: PICTOR_TEMP_DIR
    },
    api: {
        path: '/api/v1',
        redirect: 302, //false,301,302,307
        middlewares: {
            json: {},
            urlencoded: {},
            multipart: {
                uploadDir: PICTOR_UPLOAD_DIR,
                keepExtensions: false,
                maxFields: 10 * 1024 * 1024
            }
        },
        routes: {
        }
    }
};
