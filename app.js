'use strict';

var
  path = require('path'),
  express = require('express'),
  config = require('./config'),
  pictor = require('./libs/pictor'),
  routes = require('./libs/routes');

//
//
//

//process.chdir(__dirname);

pictor.configure(config.pictor);

var app = express();

app.configure('all', function () {
  app.set('views', path.join(__dirname, 'views'));
  app.set('view engine', 'jade');
  app.set('case sensitive routing', 'true');

  app.use(express.favicon());

  // embedding pictor in your app.
  app.use(config.pictor.routes.route || '/pictor', routes.createApp(config.pictor.routes));

  //routes.configureMiddlewares(app, config.pictor.routes);

  app.use(app.router);
});

//routes.configureRoutes(app, config.pictor.routes);

app.get('/', function (req, res) {
  var id = req.param('id') || '123.jpg';
  return res.render('index', {id: id});
});

// expose public & static resources
app.use(express.static(path.join(__dirname, 'public')));

//
//
//

var httpServer;

function start(callback, port, host) {
  if (httpServer) {
    console.warn('***ignore*** http server is already running!...');
    callback && callback();
    return httpServer;
  }

  port = port || (config && config.http && config.http.port) || 3000;
  host = host || (config && config.http && config.http.host) || 'localhost';

  console.log('start http server ' + host + ':' + port);
  httpServer = require('http').createServer(app).listen(port, host, callback);

  httpServer.on('close', function () {
    console.log('close http server');
    httpServer = null;
  });

  process.on('exit', stop);

  if (process.env.NODE_ENV === 'production') {
    process.on('uncaughtException', function (err) {
      console.error('***uncaughtexception***', err);
    });
  }

  return httpServer;
}

function stop() {
  if (httpServer) {
    console.log('stop http server');
    try {
      httpServer.close();
    } catch (e) {
    }
    httpServer = null;
  }
}

module.exports = app;
module.exports.start = start;
module.exports.stop = stop;

//
//
//

if (require.main === module) {
  start();
}

