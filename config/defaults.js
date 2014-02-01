'use strict';

module.exports = {
    http: {
        host: 'localhost',
        port: 3001,
        // see express-toybox/common.js#configureMiddlewares()
        json: {},
        urlencoded: {},
        multipart: {
            uploadDir: '/tmp/pictor/temp',
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
        tempDir: '/tmp/pictor/temp'
    },
    api: {
        root: '/pictor', // to mount as express sub-app
        prefix: '', // to embed in express app
        redirect: 302 //false,301,302,307
    }
};
