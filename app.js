'use strict';

var
    path = require('path'),
    express = require('express-toybox')(require('express')),
    config = require('./config');

// change current working directory for later use of 'process.cwd()'
process.chdir(__dirname);

// api with console and static pages
express.toybox.server.start(
    require('./libs/http').createApp(config)
        .set('views', path.join(__dirname, 'views'))
        .set('view engine', 'jade')
        .set('case sensitive routing', 'true')
    , config.http);

// api only!
//require('./libs/http').startServer(config);
