'use strict';

//
// ***NOTE*** this is an example using **local** storage.
//

// there are two ways using local storage:
//
// to use external web server:
// - configure your web server to expose 'baseDir' of the local storage configuration(pictor.*.baseDir).
// - configure here the 'baseUrl' of the local storage configuration(pictor.*.baseUrl)
// - no 'statics' configurations required like this configuration
//
// to use pictor as a static web server(like this configuration):
// - configure here the 'statics' under the 'http' configuration(http.statics.*)
// - configure here the 'baseDir' and 'baseUrl' under the local storage configuration(pictor.*.baseDir and pictor.*.baseUrl).

// you should provide environment variables(or modify this file):
// - PICTOR_LOCAL_DATA_DIR
// - PICTOR_LOCAL_DATA_URL
// - PICTOR_LOCAL_CACHE_DIR
// - PICTOR_LOCAL_CACHE_URL

var PICTOR_LOCAL_BASE_DIR = process.env.PICTOR_LOCAL_BASE_DIR || '/tmp/pictor';
var PICTOR_LOCAL_BASE_URL = process.env.PICTOR_LOCAL_BASE_URL || 'http://localhost:3001';
var PICTOR_LOCAL_DATA_DIR = process.env.PICTOR_LOCAL_DATA_DIR || (PICTOR_LOCAL_BASE_DIR + '/data');
var PICTOR_LOCAL_DATA_URL = process.env.PICTOR_LOCAL_DATA_URL || (PICTOR_LOCAL_BASE_URL + '/d');
var PICTOR_LOCAL_CACHE_DIR = process.env.PICTOR_LOCAL_CACHE_DIR || (PICTOR_LOCAL_BASE_DIR + '/cache');
var PICTOR_LOCAL_CACHE_URL = process.env.PICTOR_LOCAL_CACHE_URL || (PICTOR_LOCAL_BASE_URL + '/c');

if (!PICTOR_LOCAL_DATA_DIR || !PICTOR_LOCAL_DATA_URL || !PICTOR_LOCAL_CACHE_DIR || !PICTOR_LOCAL_CACHE_URL) {
    console.fatal('*** invalid configuration! see', __filename);
    return process.exit(2);
}

module.exports = {
    http: {
        logger: 'dev',
        errors: { // no error handler to easy debugging
            404: false,
            500: false
        },
        statics: {
            '/d': PICTOR_LOCAL_DATA_DIR, // see baseDir/baseUrl configurations of pictor.data
            '/c': PICTOR_LOCAL_CACHE_DIR // see baseDir/baseUrl configurations of pictor.cache
        }
    },
    pictor: {
        // see libs/storage/local.js
        data: {
            provider: 'local',
            baseDir: PICTOR_LOCAL_DATA_DIR, // this should match with http.statics
            baseUrl: PICTOR_LOCAL_DATA_URL // this should match with http.statics['/d']
        },
        cache: {
            provider: 'local',
            baseDir: PICTOR_LOCAL_CACHE_DIR, // this should match with http.statics
            baseUrl: PICTOR_LOCAL_CACHE_URL // this should match with http.statics['/c']
        }
    },
    api: {
        redirect: false // No Redirect
    }
};
