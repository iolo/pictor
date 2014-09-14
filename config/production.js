'use strict';

//
// ***NOTE*** this is an example using **s3** storage.
//

// you should provide environment variables(or modify this file):
// - PICTOR_S3_KEY
// - PICTOR_S3_SECRET
// - PICTOR_S3_DATA_BUCKET
// - PICTOR_S3_DATA_DIR
// - PICTOR_S3_DATA_URL
// - PICTOR_S3_CACHE_BUCKET
// - PICTOR_S3_CACHE_DIR
// - PICTOR_S3_CACHE_URL

var PICTOR_S3_KEY = process.env.PICTOR_S3_KEY;
var PICTOR_S3_SECRET = process.env.PICTOR_S3_SECRET;
var PICTOR_S3_DATA_BUCKET = process.env.PICTOR_S3_DATA_BUKCET || 's3pictor';
var PICTOR_S3_DATA_DIR = process.env.PICTOR_S3_DATA_DIR || '/pictor/data';
var PICTOR_S3_DATA_URL = 'http://s3.amazonaws.com/' + PICTOR_S3_DATA_BUCKET + PICTOR_S3_DATA_DIR;
var PICTOR_S3_CACHE_BUCKET = process.env.PICTOR_S3_CACHE_BUKCET || 's3pictor';
var PICTOR_S3_CACHE_DIR = process.env.PICTOR_S3_CACHE_DIR || '/pictor/cache';
var PICTOR_S3_CACHE_URL = 'http://s3.amazonaws.com/' + PICTOR_S3_CACHE_BUCKET + PICTOR_S3_CACHE_DIR;

if (!PICTOR_S3_KEY || !PICTOR_S3_SECRET || !PICTOR_S3_DATA_BUCKET || !PICTOR_S3_DATA_DIR || !PICTOR_S3_CACHE_BUCKET || !PICTOR_S3_CACHE_DIR) {
    console.fatal('*** bad or missing pictor s3 configuration! see', __filename);
    return process.exit(2);
}

module.exports = {
    http: {
        redirect: 301, // Moved_Permanently
        middlewares: {
            logger: {
                file: '/tmp/pictor-http.log',
                format: 'combined'
            }
        },
        routes: {
            errors: {
                404: {
                },
                500: {
                    stack: false
                }
            }
        }
    },
    // see libs/storage/s3.js
    data: {
        provider: 's3',
        key: PICTOR_S3_KEY,
        secret: PICTOR_S3_SECRET,
        bucket: PICTOR_S3_DATA_BUCKET,
        baseDir: PICTOR_S3_DATA_DIR,
        baseUrl: PICTOR_S3_DATA_URL // should match with above bucket/dir
    },
    cache: {
        provider: 's3',
        key: PICTOR_S3_KEY,
        secret: PICTOR_S3_SECRET,
        bucket: PICTOR_S3_CACHE_BUCKET,
        baseDir: PICTOR_S3_CACHE_DIR,
        baseUrl: PICTOR_S3_CACHE_URL // should match with above bucket/dir
    }
};
