'use strict';

module.exports = {
  "pictor": {
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
    }
  },
  "api": {
    "root": "/pictor",
    "prefix": "",
    "redirect": 307 // Temporary_Redirect
  }
};
