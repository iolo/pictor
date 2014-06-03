'use strict';

var
    path = require('path'),
    config = require('./config'),
    pictor = require('./libs/pictor'),
    debug = require('debug')('pictor:app'),
    DEBUG = debug.enabled;

// change current working directory for later use of 'process.cwd()'
process.chdir(__dirname);

// XXX: best initialization sequence & timing?
pictor.configure(config.pictor);

function createApp(config) {
    var
        express = require('express'),
        express_common = require('express-toybox').common;

    var app = express();

    app.set('views', path.join(__dirname, 'views'));
    app.set('view engine', 'jade');
    app.set('case sensitive routing', 'true');

    // NOTE: this should be prior to router middleware.
    // logger, session, cors, ...
    express_common.configureMiddlewares(app, config.http);

    // pictor as sub app.
    if (config.api) {
        app.use(config.api.root || '/pictor', require('./routes/api').createApp(config.api));
    }

    // NOTE: this should be the end of routes
    // error404, error500, ...
    express_common.configureRoutes(app, config.http);
    return app;
}

function startServer() {
    return require('express-toybox').server.start(createApp(config), config.http, function (httpServer) {
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

