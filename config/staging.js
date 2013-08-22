'use strict';

module.exports = {
  "http": {
    host: "pictor.iolo.kr",
    port: 3001
  },
  "pictor": {
    "tempDir": "/tmp/pictor/temp",
    "data": {
      "provider": "local",
      "baseDir": "/tmp/pictor/data",
      "baseUrl": "http://pictor.iolo.kr/pictor/data"
    },
    "cache": {
      "provider": "local",
      "baseDir": "/tmp/pictor/cache",
      "baseUrl": "http://pictor.iolo.kr/pictor/cache"
    },
    /*
    "data": {
      "provider": "ftp",
      "host": "jdongsu.jpg2.kr",
      "port": 21,
      "username": process.env['jdongsu.jpg2.kr.ftp.username'],
      "password": process.env['jdongsu.jpg2.kr.ftp.password'],
      "baseDir": "/pictor/data",
      "baseUrl": "http://jdongsu.jpg2.kr/pictor/data"
    },
    "cache": {
      "provider": "ftp",
      "host": "jdongsu.jpg2.kr",
      "port": 21,
      "username": process.env['jdongsu.jpg2.kr.ftp.username'],
      "password": process.env['jdongsu.jpg2.kr.ftp.password'],
      "baseDir": "/pictor/cache",
      "baseUrl": "http://jdongsu.jpg2.kr/pictor/cache"
    },
    */
    "routes": {
      "route": "/pictor",
      "skipCommonMiddlewares": false,
      "statics": {
        "/data": "/tmp/pictor/data",
        "/cache": "/tmp/pictor/cache"
      }
    }
  }
};
