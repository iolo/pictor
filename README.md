pictor
======

pictor is simple image upload/convert/download server.

getting started
---------------

1. get source from github:
  
  ```
  git clone git@github.com:iolo/node-pictor.git
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
  curl -X GET -O http://localhost:3000/pictor/foo.jpg/.json
  curl -X GET -O http://localhost:3000/pictor/foo.jpg/.xml
  curl -X GET -O http://localhost:3000/pictor/foo.jpg/xs.jpg
  curl -X GET -O http://localhost:3000/pictor/foo.jpg/s.jpg
  curl -X GET -O http://localhost:3000/pictor/foo.jpg/m.jpg
  curl -X GET -O http://localhost:3000/pictor/foo.jpg/l.jpg
  curl -X GET -O http://localhost:3000/pictor/foo.jpg/xl.jpg
  curl -X GET -O http://localhost:3000/pictor/foo.jpg/100x200.jpg
  curl -X GET -O http://localhost:3000/pictor/foo.jpg/100.jpg
  curl -X GET -O http://localhost:3000/pictor/foo.jpg/x200.jpg
  curl -X GET -O http://localhost:3000/pictor/foo.jpg/100x200+30+40.jpg
  curl -X GET -O http://localhost:3000/pictor/foo.jpg/100x200@2x.jpg
  curl -X DELETE http://localhost:3000/pictor/foo.jpg
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
open build/apidoc/index.html
```

* for source code documents:

```
grunt dox
open build/dox/index.html
```

advanced topics
---------------

* embedding pictor in your app
* custom storage provider
* TBW...

--

that's all folks...

may the source be with you...
