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

- *업로드*는 pictor가 처리합니다. 가능하다면 클라우드/원격 스토리지가 처리할 수도 있습니다.
- *변환*은 pictor가 처리합니다.
- *다운로드*는 가능하다면 클라우드/원격 스토리지가 처리합니다. 원한다면 pictor가 처리할 수도 있습니다.
- 모든 파일은 클라우드/원격 저장소에 보관됩니다. 물론 로컬 저장소도 사용할 수 있습니다.
- 모든 변환된 파일(pictor가 생성한)은 *언제든지* 삭제해도 됩니다. 필요하면 pictor가 다시 생성합니다.

![다이어그램](../master/app/img/how_pictor_works/pictor.png?raw=true)

시작하기
-------

1. install prerequisites

  for mac osx:
  ```
  brew install graphicsmagick
  ```
  for debian/ubuntu linux:
  ```
  apt-get install graphicsmagick
  ```
  or else see http://graphicsmagick.org

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

  or startup with cluster:

  ```
  node cluster.js
  ```

1. test run in browser

  ```
  open http://localhost:3001
  ```
  
1. test run in console

  ```
	TBD...
  ```

설정
----

설정 파일은 `config` 디렉토리 아래에 각 환경(`NODE_ENV` 환경 변수)별로 분리되어 있습니다.

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

* to show debug logs

set `DEBUG` environment variable to `*` or `pictor:*` and run pictor.

see http://github.com/visionmedia/debug

* external dependencies for converters
  * convert/resize/thumbnail/crop/resizecrop/meta/exif/holder: [graphicsmagick](http://graphicsmagick.org)(or [imagemagick](http://imagemagick.org)))
  * optimize jpeg: [jpegtran](http://jpegclub.org/jpegtran/) (already included via [jpegtran-bin nodejs module](https://github.com/yeoman/node-jpegtran-bin))
  * optimize png: [optipng](http://optipng.sourceforge.net) (already included via [optipng-bin nodejs moudle](https://github.com/yeoman/node-optipng-bin))
  * optimize gif: [gifsicle](http://www.lcdf.org/gifsicle/) (already included via [gifsicle nodejs module](https://github.com/yeoman/node-gifsicle))

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
app/ -- 정적 웹 리소스 소스(클라이언트측) --> concat, uglify, copy, jade task
  js/ -- 자바스크립트 소스(클라이언트 측) --> jshint task
  ...
build/
  app/ --> 정적 웹 리소스의 빌드 결과(클라이언트측)
    docs/
      api/ --> apidoc이 routes/를 대상으로 생성한 문서 --> apidoc task
      dox/ --> doxx가 libs/를 대상으로 생성한 문서 --> doxx task
    ...
app.js -- 클러스터를 사용하지 않는 nodejs 실행 모듈(server-side)
cluster.js -- 클러스터를 사용한 nodejs 실행 모듈(server-side)
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
