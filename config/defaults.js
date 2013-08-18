'use strict';

module.exports = {
  "http": {
    host: "localhost",
    port: 3000
  },
  "pictor": {
    "data": {
      "provider": "local",
      "baseUrl": "http://localhost:3000/pictor/data",
      "basePath": "/tmp/pictor/data"
    },
    "cache": {
      "provider": "local",
      "baseUrl": "http://localhost:3000/pictor/cache",
      "basePath": "/tmp/pictor/cache"
    },
    /* not yet working!!!
    "data": {
      "provider": "ftp",
      "baseUrl": "http://jdongsu.jpg2.kr/pictor/data",
      "basePath": "/pictor/data",
      "host": "jdongsu.jpg2.kr",
      "port": 21,
      "username": process.env['jdongsu.jpg2.kr.username'],
      "password": process.env['jdongsu.jpg2.kr.password']
    },
    "cache": {
      "provider": "ftp",
      "baseUrl": "http://jdongsu.jpg2.kr/pictor/data",
      "basePath": "/pictor/data",
      "host": "jdongsu.jpg2.kr",
      "port": 21,
      "username": process.env['jdongsu.jpg2.kr.username'],
      "password": process.env['jdongsu.jpg2.kr.password']
    },
    */
    "routes": {
      "skipCommonMiddlewares": false,
      "statics": {
        "/data": "/tmp/pictor/data",
        "/cache": "/tmp/pictor/cache"
      }
    }
  }
};
