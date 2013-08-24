'use strict';

var
  _ = require('lodash'),
  debug = require('debug')('pictor:config'),
  DEBUG = debug.enabled;

module.exports = _.merge(require('./defaults'), require('./' + (process.env.NODE_ENV || 'development')));

DEBUG && debug('configuration for ', process.env.NODE_ENV, '\n----------\n', require('util').inspect(module.exports, {depth: null}), '\n----------');
