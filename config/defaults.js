'use strict';

module.exports = {
  "http": {
    host: "localhost",
    port: 3001,
    // session : ...
    // logger : ...
    // errors: {
    //   404: {},
    //   500: {}
    // },
    root: "build/app" // build output of static web resources
  },
  "pictor": {
//    // see libs/storage/local.js
//    "data": {
//      "provider": "local",
//      "baseDir": "/tmp/pictor/data",
//      "baseUrl": "http://localhost:3001/pictor/data"
//    },
//    "cache": {
//      "provider": "local",
//      "baseDir": "/tmp/pictor/cache",
//      "baseUrl": "http://localhost:3001/pictor/cache"
//    },
//    // see libs/storage/ftp.js
//    "data": {
//      "provider": "ftp",
//      "host": "jdongsu.jpg2.kr",
//      "port": 21,
//      "username": process.env.PICTOR_FTP_USERNAME,
//      "password": process.env.PICTOR_FTP_PASSWORD,
//      "baseDir": "/pictor/data",
//      "baseUrl": "http://jdongsu.jpg2.kr/pictor/data"
//    },
//    "cache": {
//      "provider": "ftp",
//      "host": "jdongsu.jpg2.kr",
//      "port": 21,
//      "username": process.env.PICTOR_FTP_USERNAME,
//      "password": process.env.PICTOR_FTP_PASSWORD,
//      "baseDir": "/pictor/cache",
//      "baseUrl": "http://jdongsu.jpg2.kr/pictor/cache"
//    },
//    // see libs/storage/s3.js
//    "data": {
//      "provider": "s3",
//      "key": process.env.PICTOR_S3_KEY,
//      "secret": process.env.PICTOR_S3_SECRET,
//      "bucket": "s3pictor",
//      "baseDir": "/pictor/data",
//      "baseUrl": "http://s3.amazonaws.com/s3pictor/pictor/data"
//    },
//    "cache": {
//      "provider": "s3",
//      "key": process.env.PICTOR_S3_KEY,
//      "secret": process.env.PICTOR_S3_SECRET,
//      "bucket": "s3pictor",
//      "baseDir": "/pictor/cache",
//      "baseUrl": "http://s3.amazonaws.com/s3pictor/pictor/cache"
//    },
    "converters": { // see libs/converter
      "convert": {},
      "resize": {},
      "thumbnail": {},
      "crop": {},
      "cropresize": {},
      "resizecrop": {},
      "watermark": {},
      "optimize": {},
      "meta": {},
      "exif": {},
      "holder": {}
    },
    "tempDir": "/tmp/pictor/temp"
  },
  "api": {
//    "root": "/pictor",
//    "prefix": "/pictor",
//    "redirect": 302 //false,301,302,307
  }
};
