'use strict';

var
    _ = require('lodash');

module.exports = _.defaults(require('./' + (process.env.NODE_ENV || 'development')), require('./defaults'));
