'use strict';

/** @module pictor.http */

var
    util = require('util'),
    http = require('http'),
    Q = require('q'),
    _ = require('lodash'),
    express = require('express-toybox')(require('express')),
    pictor = require('./pictor'),
    routes = require('./routes'),
    debug = require('debug')('pictor:http'),
    DEBUG = debug.enabled;

/**
 * create express router.
 *
 * @param {*} opts
 * @param {*} opts.pictor
 * @param {*} opts.http
 * @param {*} [opts.http.auth]
 * @param {*} [opts.http.middlewares]
 * @param {*} [opts.http.routes]
 * @returns {express.application}
 */
function createRouter(opts) {
    DEBUG && debug('create pictor router...');

    // XXX: best initialization sequence & timing?
    pictor.configure(opts.pictor);

    return express.Router()
        // auth
        .use(routes.auth(opts.http.auth))
        // files
        .post('/upload', routes.files.uploadFiles)
        .put('/upload', routes.files.uploadFileRaw)
        .get('/upload', routes.files.uploadFileUrl)
        .get('/delete', routes.files.deleteFile)
        .get('/download', routes.files.downloadFile)
        // XXX: experimental for issue #4 and #5
        .get('/rename', routes.files.renameFile)
        .get('/files', routes.files.listFiles)
        // convert
        .post('/convert', routes.convert.convertFile)
        .get('/convert', routes.convert.convertAndDownloadFile)
        // rest
        .post('/:id', routes.rest.uploadFileRestful)
        .put('/:id', routes.rest.uploadFileRawRestful)
        .delete('/:id', routes.rest.deleteFileRestful)
        .get('/:id', routes.rest.downloadFileRestful)
        // images
        .get(routes.images.downloadHolderImage.PATH, routes.images.downloadHolderImage)
        .get(routes.images.downloadResizeImage.PATH, routes.images.downloadResizeImage)
        .get(routes.images.downloadThumbnailImage.PATH, routes.images.downloadThumbnailImage)
        .get(routes.images.downloadCropImage.PATH, routes.images.downloadCropImage)
        .get(routes.images.downloadRotateImage.PATH, routes.images.downloadRotateImage)
        .get(routes.images.downloadResizeCropImage.PATH, routes.images.downloadResizeCropImage)
        .get(routes.images.downloadCropResizeImage.PATH, routes.images.downloadCropResizeImage)
        .get(routes.images.downloadPresetImage.PATH, routes.images.downloadPresetImage)
        // info
        .get('/info/converters', routes.info.getConverters)
        .get('/info/presets', routes.info.getPresets);
}

/**
 * create express app.
 *
 * @param {*} opts
 * @param {string} opts.http.prefix
 * @param {*} [opts.http.middlewares]
 * @param {*} [opts.http.routes]
 */
function createApp(opts) {
    DEBUG && debug('create pictor app...');
    return express()
        .useCommonMiddlewares(opts.http.middlewares)
        .use(opts.http.prefix, createRouter(opts))
        .useCommonRoutes(opts.http.routes);
}

/**
 * @param {*} opts
 * @param {string} [opts.http.host]
 * @param {number} [opts.http.port]
 * @param {function} [callback]
 * @returns {*}
 */
function startServer(opts, callback) {
    DEBUG && debug('*** start pictor server...');
    return express.toybox.server.start(createApp(opts), opts.http, callback);
}

function stopServer(callback) {
    DEBUG && debug('*** stop pictor server...');
    return express.toybox.server.stop(callback);
}

module.exports = {
    createRouter: createRouter,
    createApp: createApp,
    startServer: startServer,
    sopServer: stopServer
};
