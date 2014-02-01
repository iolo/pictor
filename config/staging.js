'use strict';

//
// ***NOTE*** this is an example using **ftp** storage.
//

// you should provide environment variables(or modify this file):
// - PICTOR_PICTOR_HOST
// - PICTOR_PICTOR_PORT
// - PICTOR_PICTOR_USERNAME
// - PICTOR_PICTOR_PASSWORD
// - PICTOR_PICTOR_DATA_DIR
// - PICTOR_PICTOR_DATA_URL
// - PICTOR_PICTOR_CACHE_DIR
// - PICTOR_PICTOR_CACHE_URL

var PICTOR_FTP_HOST = process.env.PICTOR_FTP_HOST || 'jdongsu.jpg2.kr';
var PICTOR_FTP_PORT = Number(process.env.PICTOR_FTP_PORT) || 21;
var PICTOR_FTP_USERNAME = process.env.PICTOR_FTP_USERNAME;
var PICTOR_FTP_PASSWORD = process.env.PICTOR_FTP_PASSWORD;
var PICTOR_FTP_DATA_DIR = process.env.PICTOR_FTP_DATA_DIR;
var PICTOR_FTP_DATA_URL = process.env.PRICTOR_FTP_DATA_URL || ('http://' + PICTOR_FTP_HOST + +PICTOR_FTP_DATA_DIR);
var PICTOR_FTP_CACHE_DIR = process.env.PICTOR_FTP_CACHE_DIR;
var PICTOR_FTP_CACHE_URL = process.env.PRICTOR_FTP_CACHE_URL || ('http://' + PICTOR_FTP_HOST + +PICTOR_FTP_CACHE_DIR);

if (!PICTOR_FTP_HOST || !PICTOR_FTP_PORT || !PICTOR_FTP_USERNAME || !PICTOR_FTP_PASSWORD || !PICTOR_FTP_DATA_DIR || !PICTOR_FTP_CACHE_DIR) {
    console.fatal('*** invalid configuration! see', __filename);
    return process.exit(2);
}

module.exports = {
    pictor: {
        // see libs/storage/ftp.js
        data: {
            provider: 'ftp',
            host: PICTOR_FTP_HOST,
            port: PICTOR_FTP_PORT,
            username: PICTOR_FTP_USERNAME,
            password: PICTOR_FTP_PASSWORD,
            baseDir: PICTOR_FTP_DATA_DIR,
            baseUrl: PICTOR_FTP_DATA_URL
        },
        cache: {
            provider: 'ftp',
            host: PICTOR_FTP_HOST,
            port: PICTOR_FTP_PORT,
            username: PICTOR_FTP_USERNAME,
            password: PICTOR_FTP_PASSWORD,
            baseDir: PICTOR_FTP_CACHE_DIR,
            baseUrl: PICTOR_FTP_CACHE_URL
        }
    },
    api: {
        redirect: 307 // Temporary_Redirect
    }
};
