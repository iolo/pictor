pictor
======

[한글](README.ko.md)

pictor is simple image upload/convert/download server.

The name of pictor comes from [Pictor, a constellation](http://en.wikipedia.org/wiki/Pictor).

![logo](../master/app/img/pictor.jpg?raw=true)

Introduction
------------

Local storages and traffic are *expensive*, especially in cloud environment.

There're many *cheap* and *large* cloud/remote storage services,
most of them provide *cheap* and *fast* HTTP access.

ex. Amazon S3, FTP+HTTP Static Image Hosting Services...

pictor is designed for these environment.

pictor basically works as following:

* *upload* is accomplished by pictor. cloud/remote storage can do if possible.
* *convert* is accomplished by pictor.
* *download* is accomlished by cloud/remote storage. pictor can do if you want.
* all files are stored in cloud/remote storage. local storage can do if you want.
* all variant files(generated by pictor) could be deleted *at any anytime*. pictor will generate it on demand.

![diagram](../master/app/img/how_pictor_works.png?raw=true)

Getting Started
---------------

1. install prerequisites
    for mac osx:
    ```
    $ brew install graphicsmagick
    ```
    for debian/ubuntu linux:
    ```
    $ apt-get install graphicsmagick
    ```
    or else see http://graphicsmagick.org
1. download & install pictor
    install with npm:
    ```
    $ npm install pictor
    ```
    or get source from github:
    ```
    $ git clone git@github.com:iolo/pictor.git
    ```
1. startup pictor server
    start as standalone:
    ```
    $ ./bin/pictor --host=0.0.0.0 --port=3001
    ```
    or startup with pm2
    ```
    $ npm install pm2 -g
    $ pm2 start -i 4 -n pictor ./bin/pictor -- --host=0.0.0.0 --port=3001
    ```
1. test run in browser
    ```
    $ open http://localhost:3001
    ```
1. test run in console
    ```
    TBD...
    ```

Configurations
--------------

configuration files are located in `config` directory for various environment.

you should specify the environment with `PICTOR_ENV` or `NODE_ENV` environment variable.

you could specify the absolute path to the configuration file with `PICTOR_CONFIG` environment variable also.

for more details, see [source code of default configuration](../master/config/defaults.js).

Generated Documents
--------------------

* [api documents](http://pictor.iolo.kr/docs/api/)
* [source code Documents](http://pictor.iolo.kr/docs/dox/)

Advanced Topics
---------------

* embedding pictor in other [expressjs](http://expressjs.com) app
* custom storage
* custom converter
* TBW...

Internals
---------

* to show debug logs

set `DEBUG` environment variable to `*` or `pictor:*` and run pictor.

```
$ DEBUG='*' ./bin/pictor
```

see http://github.com/visionmedia/debug

* external dependencies for converters
    - convert/resize/thumbnail/rotate/crop/resizecrop/meta/exif/holder: [graphicsmagick](http://graphicsmagick.org)(or [imagemagick](http://imagemagick.org)))
    - optimize jpeg: [jpegtran](http://jpegclub.org/jpegtran/) (already included via [jpegtran-bin nodejs module](https://github.com/yeoman/node-jpegtran-bin))
    - optimize png: [optipng](http://optipng.sourceforge.net) (already included via [optipng-bin nodejs moudle](https://github.com/yeoman/node-optipng-bin))
    - optimize gif: [gifsicle](http://www.lcdf.org/gifsicle/) (already included via [gifsicle nodejs module](https://github.com/yeoman/node-gifsicle))
    - ...

* project directory structure

```
config/ --- configurations for each environment(server-side)
libs/ -- nodejs modules(server-side) --> jshint, doxx task
    converter/ -- converters
    storage/ -- storage providers
    pictor.js -- the main module
  ...
routes/ -- expressjs modules(server-side) --> jshint, apidoc task
tests/
    **/*_test.js -- nodeunit testcases(server-side) --> nodeunit task
    **/*_test.html -- qunit testcases(client-side) --> qunit task
app/ -- source of static web resources(client-side) --> concat, uglify, copy, jade task
    js/ -- javascript source(client-side) --> jshint task
    ...
build/
    app/ --> build output of static web resources(client-side)
      docs/
        api/ --> generated documents of apidoc for routes/ --> apidoc task
        dox/ --> generated documents of doxx for libs/ --> doxx task
      ...
app.js -- launcher without cluster(server-side)
bin/pictor -- launcher with cluster(server-side)
```

* to generate api documents from source

```
grunt apidoc
open build/app/docs/api/index.html
```

* to generate source code documents from source

```
grunt doxx
open build/app/docs/api/index.html
```

--

that's all folks...

may the source be with you...
