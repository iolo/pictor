'use strict';

/** @module pictor.presets */

module.exports = {
    xxs: {converter: 'thumbnail', w: 16},
    xs: {converter: 'thumbnail', w: 24},
    s: {converter: 'thumbnail', w: 32},
    m: {converter: 'thumbnail', w: 48},
    l: {converter: 'thumbnail', w: 64},
    xl: {converter: 'thumbnail', w: 128},
    xxl: {converter: 'thumbnail', w: 256},
    'xxs@2x': {converter: 'thumbnail', w: 32},
    'xs@2x': {converter: 'thumbnail', w: 48},
    's@2x': {converter: 'thumbnail', w: 64},
    'm@2x': {converter: 'thumbnail', w: 96},
    'l@2x': {converter: 'thumbnail', w: 128},
    'xl@2x': {converter: 'thumbnail', w: 256},
    'xxl@2x': {converter: 'thumbnail', w: 512}
};
