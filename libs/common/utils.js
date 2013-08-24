'use strict';

var
  crypto = require('crypto'),
  _ = require('lodash'),
  Q = require('q');

/**
 * get gravatar url.
 *
 * @param {String} email
 * @param {Number=} size
 * @return {String} gravatar url
 */
function gravatarIcon(email, size) {
  var url = 'http://www.gravatar.com/avatar/';
  if (email) {
    url += crypto.createHash('md5').update(email.toLowerCase()).digest('hex');
  }
  if (size) {
    url += '?s=' + size;
  }
  return url;
}

/**
 * generate nonce string.
 *
 * @param {Number} len
 * @return {String} nonce string
 */
function generateNonce(len) {
  return crypto.randomBytes(len).toString('hex');
}

/**
 * digest password string with optional salt.
 *
 * @param {String} password
 * @param {String=} salt
 * @return {String} digested password string
 */
function digestPassword(password, salt) {
  var hash = (salt) ? crypto.createHmac('sha1', salt) : crypto.createHash('sha1');
  return hash.update(password).digest('hex');
}

/**
 *
 * @param {Array.<string>} tags
 * @param {string} [separator=',']
 * @returns {string}
 */
function joinTags(tags, separator) {
  return tags ? tags.join(separator || ',') : '';
}

/**
 *
 * @param {string} tags
 * @param {string} [separator=',']
 * @returns {Array.<string>}
 */
function splitTags(tags, separator) {
  if (!tags) {
    return [];
  }
  return tags.split(separator || ',').map(function (tag) {
    return tag.trim();
  });
}

// XXX: buggy!
function interpolate(path, params) {
  Object.keys(params).forEach(function (key) {
    path = path.replace(new RegExp(':' + key), params[key]);
  });
  return path;
}

function prefixRegExp(str, options) {
  return new RegExp('^' + str.trim(), options);
}

/**
 *
 * @param {Object} obj
 * @param {Array.<string>} properties
 * @returns {Object}
 */
function includeProperties(obj, properties) {
  return _.pick(obj, properties);
}

/**
 *
 * @param {Object} obj
 * @param {Array.<string>} properties
 * @returns {Object}
 */
function excludeProperties(obj, properties) {
  return _.omit(obj, properties);
}

/**
 *
 * @param {Array.<object>} objs
 * @param {string} property
 * @returns {Array}
 */
function extractProperty(objs, property) {
  return _.pluck(objs, property);
}

// TODO:
function sendMail() {
  console.log('*** sendMail ***');
  console.log(arguments);
}

// TODO:
function sendPush() {
  console.log('*** sendPush ***');
  console.log(arguments);
}

module.exports = {
  gravatarIcon: gravatarIcon,
  generateNonce: generateNonce,
  digestPassword: digestPassword,
  joinTags: joinTags,
  splitTags: splitTags,
  interpolate: interpolate,
  prefixRegExp: prefixRegExp,
  includeProperties: includeProperties,
  excludeProperties: excludeProperties,
  extractProperty: extractProperty,
  sendMail: sendMail,
  sendPush: sendPush
};
