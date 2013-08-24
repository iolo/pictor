'use strict';

module.exports = {
  "pictor": {
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
    }
  }
};
