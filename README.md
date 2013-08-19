pictor
======

pictor is simple image upload/convert/download server.

getting started
---------------

1. get source from github:
  
  ```
  git clone git@github.com:iolo/pictor.git
  ```
  
  or install with npm:
  
  ```
  npm install pictor
  ```
  
1. startup pictor server


  ```
  node app.js
  ```
  
1. test run in browser

  ```
  open http://localhost:3000
  ```
  
1. test run in console

  ```
  curl -X PUT --data-binary=@foo.jpg http://localhost:3000/pictor/foo.jpg
  curl -X GET -O http://localhost:3000/pictor/foo.jpg
  curl -X GET -O http://localhost:3000/pictor/foo.jpg/.png
  curl -X GET -O http://localhost:3000/pictor/foo.jpg/400x300.jpg
  curl -X GET -O http://localhost:3000/pictor/foo.jpg/400.jpg
  curl -X GET -O http://localhost:3000/pictor/foo.jpg/x300.jpg
  curl -X GET -O http://localhost:3000/pictor/foo.jpg/400x300+200+100.jpg
  curl -X GET -O http://localhost:3000/pictor/foo.jpg/400x300@2x.jpg
  curl -X GET -O http://localhost:3000/pictor/foo.jpg/m.jpg
  curl -X GET -O http://localhost:3000/pictor/foo.jpg/meta
  curl -X GET -O http://localhost:3000/pictor/foo.jpg/exif
  curl -X DELETE http://localhost:3000/pictor/foo.jpg
  curl -X GET -O http://localhost:3000/pictor/holder/400x300.jpg
  curl -X GET -O http://localhost:3000/pictor/holder/m.jpg
  ```

configuration
-------------

configurations are located in `config` directory for each `NODE_ENV`.

see `config/defaults.js`.

documents
---------

* for api documents:

```
grunt apidoc
open public/docs/api/index.html
```

or see [api documents](http://pictor.iolo.kr/docs/api/)

* for source code documents:

```
grunt doxx
open public/docs/dox/index.html
```

or see [source code documents](http://pictor.iolo.kr/docs/src/)

advanced topics
---------------

* embedding pictor in your app
* custom storage provider
* TBW...

--

that's all folks...

may the source be with you...
