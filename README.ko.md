pictor
======

[English](README.md)

pictor는 간단한 이미지 업로드/변환/다운로드 서버입니다.

pictor의 이름은 [화가의 별자리](http://en.wikipedia.org/wiki/Pictor)에서 따왔습니다.

![logo](../master/app/img/pictor.jpg?raw=true)

소개
----

로컬 저장소와 트래픽은 *비쌉니다*. 클라우드 환경에서는 특히 그렇죠.

세상에는 다양한 *싸고* *큰* 클라우드/원격 저장소 서비스들이 있고,
그 서비스들은 대개 *싸고* *빠른* HTTP 접근을 제공합니다.

예. [아마존 S3](http://aws.amazon.com/s3), [카페24](http://cafe24.com)나 [PHP스쿨호스팅](http://phps.kr) 같은데서 제공하는 FTP+HTTP 정적 이미지 호스팅 서비스...

pictor는 이런 환경에 맞춰 설계되었습니다.

pictor는 기본적으로 다음과 같이 동작합니다:

* *업로드*는 pictor가 처리합니다. 가능하다면 클라우드/원격 스토리지가 처리할 수도 있습니다.
* *변환*은 pictor가 처리합니다.
* *다운로드*는 가능하다면 클라우드/원격 스토리지가 처리합니다. 원한다면 pictor가 처리할 수도 있습니다.
* 모든 파일은 클라우드/원격 저장소에 보관됩니다. 물론 로컬 저장소도 사용할 수 있습니다.
* 모든 변환된 파일(pictor가 생성한)은 *언제든지* 삭제해도 됩니다. 필요하면 pictor가 다시 생성합니다.

![다이어그램](../master/app/img/how_pictor_works/pictor.png?raw=true)

시작하기
-------

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

설정
----

`config` 디렉토리에 다양한 환경을 위한 설정 파일들이 있습니다.

`PICTOR_ENV` 또는 `NODE_ENV` 환경 변수로 환경을 지정할 수 있습니다.

`PICTOR_CONFIG` 환경 변수로 설정 파일의 절대 경로를 지정할 수도 있습니다.

자세한 내용은 [기본 설정의 소스 코드](../master/config/defaults.js)를 참고하세요.

생성된 문서
----------

* [API 문서](http://pictor.iolo.kr/docs/api/)
* [소스 코드 문서](http://pictor.iolo.kr/docs/dox/)

고급 주제
--------

* pictor를 다른 [expressjs](http://expressjs.com) 앱에 내장하기
* 커스텀 저장소
* 커스텀 변환기
* TBW...

내부
----

* 디버그 로그를 보려면:

`DEBUG` 환경변수를 `*` 또는 `pictor:*` 로 설정하고 pictor를 실행하세요.

```
$ DEBUG='*' ./bin/pictor
```

참조: http://github.com/visionmedia/debug

* 변환기별 외부 의존성
    - convert/resize/thumbnail/rotate/crop/resizecrop/meta/exif/holder: [graphicsmagick](http://graphicsmagick.org)(or [imagemagick](http://imagemagick.org)))
    - optimize jpeg: [jpegtran](http://jpegclub.org/jpegtran/) ([jpegtran-bin nodejs module](https://github.com/yeoman/node-jpegtran-bin)을 통해 포함되어 있음)
    - optimize png: [optipng](http://optipng.sourceforge.net) ([optipng-bin nodejs moudle](https://github.com/yeoman/node-optipng-bin)을 통해 포함되어 있음)
    - optimize gif: [gifsicle](http://www.lcdf.org/gifsicle/) ([gifsicle nodejs module](https://github.com/yeoman/node-gifsicle)을 통해 포함되어 있음)
    - ...

* 프로젝트 디렉토리 구조

```
config/ --- 환경별 설정(서버측)
libs/ -- nodejs 모듈(서버측) --> jshint, doxx task
    converter/ -- converters
    storage/ -- storage providers
    pictor.js -- the main module
    ...
routes/ -- expressjs 모듈(서버측) --> jshint, apidoc task
tests/
    **/*_test.js -- nodeunit 테스트케이스(서버측) --> nodeunit task
    **/*_test.html -- qunit 테스트케이스(서버측) --> qunit task
public/ -- 정적 웹 리소스 소스(클라이언트측) --> concat, uglify, copy, jade task
    js/ -- 자바스크립트 소스(클라이언트 측) --> jshint task
    ...
build/
    public/ --> 정적 웹 리소스의 빌드 결과(클라이언트측)
      docs/
        api/ --> apidoc이 routes/를 대상으로 생성한 문서 --> apidoc task
        dox/ --> doxx가 libs/를 대상으로 생성한 문서 --> doxx task
      ...
app.js -- 클러스터를 사용하지 않는 실행 모듈(server-side)
bin/pictor -- 클러스터를 사용한 실행 모듈(server-side)
```

* 소스에서 API 문서 생성하기

```
grunt apidoc
open public/docs/api/index.html
```

* 소스에서 소스 코드 문서 생성하기

```
grunt doxx
open public/docs/dox/index.html
```

--

that's all folks...

may the source be with you...
