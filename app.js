'use strict';

var
    path = require('path'),
    express = require('express-toybox')(require('express')),
    debug = require('debug')('pictor:app'),
    DEBUG = debug.enabled;

// change current working directory for later use of 'process.cwd()'
process.chdir(__dirname);

function createApp(config) {
    var app = express()
        .set('views', path.join(__dirname, 'views'))
        .set('view engine', 'jade')
        .set('case sensitive routing', 'true')
        .useCommonMiddlewares(config.http.middlewares);

    if (config.api) {
        app.use(config.api.path || '/api/v1', require('./routes').api(config))
    }

    return app.useCommonRoutes(config.http.routes);
}

function startServer(config) {
    return express.toybox.server.start(createApp(config), config.http, function () {
        DEBUG && debug('*** pictor server ready!');
    });
}

module.exports.createApp = createApp;
module.exports.startServer = startServer;

//
// ***CLI ENTRY POINT***
//

if (require.main === module) {
    startServer();
}

