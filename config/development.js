'use strict';

// there are two ways using local storage:
//
// to use external web server:
// - configure your web server to expose 'baseDir' of the local storage configuration(pictor.*.baseDir).
// - configure here the 'baseUrl' of the local storage configuration(pictor.*.baseUrl)
// - no 'statics' configurations required like this configuration
//
// to use pictor as a static web server(like this configuration):
// - configure here the 'statics' under the 'http' configuration(http.statics.*)
// - configure here the 'baseDir' and 'baseUrl' under the local storage configuration(pictor.*.baseDir and pictor.*.baseUrl).

module.exports = {
  "http": {
    "statics": {
      "/d": "/tmp/pictor/data", // see baseDir/baseUrl configurations of pictor.data
      "/c": "/tmp/pictor/cache" // see baseDir/baseUrl configurations of pictor.cache
    }
  },
  "pictor": {
    "data": {
      "provider": "local",
      "baseDir": "/tmp/pictor/data", // this should match with http.statics
      "baseUrl": "http://localhost:3001/d" // this should match with http.statics
    },
    "cache": {
      "provider": "local",
      "baseDir": "/tmp/pictor/cache", // this should match with http.statics
      "baseUrl": "http://localhost:3001/c" // this should match with http.statics
    }
  },
  "api": {
    "root": "/pictor",
    "prefix": "",
    "redirect": false // No Redirect
  }
};
