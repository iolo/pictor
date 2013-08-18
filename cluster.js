'use strict';

var
  cluster = require('cluster');

if (cluster.isMaster) {
  console.log([
    "P.I.C.T.O.R"
  ].join('\n'));

  var numWorkers = require('os').cpus().length;

  cluster.on('fork', function (worker) {
    console.log('worker#' + worker.id + ' pid=' + worker.process.pid + ' --> fork!');
  });

  cluster.on('online', function (worker) {
    console.log('worker#' + worker.id + ' pid=' + worker.process.pid + ' --> online!');
  });

  cluster.on('listening', function (worker, address) {
    console.log('worker#' + worker.id + ' pid=' + worker.process.pid + ' --> listening on ' + address.address + ':' + address.port);
  });

  cluster.on('exit', function (worker) {
    console.log('worker#' + worker.id + ' pid=' + worker.process.pid + ' --> exit:' + worker.process.exitCode);
    //console.log('restart worker...');
    //cluster.folk();
  });

  for (var i = 0; i < numWorkers; i += 1) {
    cluster.fork();
  }
} else {
  require('./app').start();
}

