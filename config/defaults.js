'use strict';

module.exports = {
  "http": {
    host: "localhost",
    port: 3000
  },
  "pictor": {
    "tempDir": "/tmp/pictor/temp",
    /*
     "data": {
     "provider": "local",
     "baseDir": "/tmp/pictor/data",
     "baseUrl": "http://localhost:3000/pictor/data"
     },
     "cache": {
     "provider": "local",
     "baseDir": "/tmp/pictor/cache",
     "baseUrl": "http://localhost:3000/pictor/cache"
     },
     "data": {
     "provider": "ftp",
     "host": "jdongsu.jpg2.kr",
     "port": 21,
     "username": process.env.PICTOR_FTP_USERNAME,
     "password": process.env.PICTOR_FTP_PASSWORD,
     "baseDir": "/pictor/data",
     "baseUrl": "http://jdongsu.jpg2.kr/pictor/data"
     },
     "cache": {
     "provider": "ftp",
     "host": "jdongsu.jpg2.kr",
     "port": 21,
     "username": process.env.PICTOR_FTP_USERNAME,
     "password": process.env.PICTOR_FTP_PASSWORD,
     "baseDir": "/pictor/cache",
     "baseUrl": "http://jdongsu.jpg2.kr/pictor/cache"
     },
     "data": {
     "provider": "s3",
     "key": process.env.PICTOR_S3_KEY,
     "secret": process.env.PICTOR_S3_SECRET,
     "bucket": "s3pictor",
     "baseDir": "/pictor/data",
     "baseUrl": "http://s3.amazonaws.com/s3pictor/pictor/data"
     },
     "cache": {
     "provider": "s3",
     "key": process.env.PICTOR_S3_KEY,
     "secret": process.env.PICTOR_S3_SECRET,
     "bucket": "s3pictor",
     "baseDir": "/pictor/cache",
     "baseUrl": "http://s3.amazonaws.com/s3pictor/pictor/cache"
     },
     */
    "routes": {
      "route": "/pictor",
      "redirectStatusCode": false,//false,301,302,307
      "skipCommonMiddlewares": false,
      "statics": {
        "/data": "/tmp/pictor/data",
        "/cache": "/tmp/pictor/cache"
      }
    }
  }
};
