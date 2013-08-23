'use strict';

module.exports = {
  "http": {
    host: "pictor.iolo.kr",
    port: 3001
  },
  "pictor": {
    "tempDir": "/tmp/pictor/temp",
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
    "routes": {
      "route": "/pictor",
      "redirectStatusCode": 307, // for easy test, redirect temporary!
      "skipCommonMiddlewares": false,
      "statics": {
        "/data": "/tmp/pictor/data",
        "/cache": "/tmp/pictor/cache"
      }
    }
  }
};
