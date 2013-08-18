'use strict';

module.exports = {
  "http": {
    host: "pictor.iolo.kr",
    port: 3001
  },
  "pictor": {
    "data": {
      "provider": "local",
      "baseUrl": "http://pictor.iolo.kr/pictor/data",
      "basePath": "/tmp/pictor/data"
    },
    "cache": {
      "provider": "local",
      "baseUrl": "http://pictor.iolo.kr/pictor/cache",
      "basePath": "/tmp/pictor/cache"
    },
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
