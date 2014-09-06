/*!
 * Pictor Library - AngularJS Version
 * Copyright (c) 2013 IoloTheBard <iolothebard@gmail.com>
 * All Rights Reserved.
 */
(function (angular) {
    'use strict';

    var module = angular.module('pictor', []);

    /**
     *
     */
    module.value('pictor.config', {
        PICTOR_ENDPOINT: '/api/v1'
    });

    /**
     *
     */
    module.factory('pictor', [
        '$window', '$document', '$q', '$rootScope', '$http', 'pictor.config',
        function (window, document, Q, root, http, config) {

            var debug = console.log.bind(console);
            var DEBUG = true;

            function encodeQueryString(params) {
                var queryParams = [];
                angular.forEach(params, function (v, k) {
                    queryParams.push([encodeURIComponent(k), encodeURIComponent(v)].join('='));
                });
                return queryParams.join('&');
            }

            function pictorUrl(path, params) {
                var url = config.PICTOR_ENDPOINT + path;
                if (params) {
                    url += ((url.indexOf('?') === -1) ? '?' : '&') + encodeQueryString(params);
                }
                return url;
            }

            function _request(method, path, data, params) {
                var req = {
                    method: method,
                    url: pictorUrl(path),
                    headers: {Accept: 'application/json'},
                    withCredentials: true
                };
                if (data) {
                    req.headers['Content-Type'] = 'application/json;charset=utf8';
                    req.data = data;
                }
                if (params) {
                    req.params = params;
                }
                // req.headers.Authorization = 'Bearer ' + SHA1(key + secret + nonce) + nonce
                return http(req).then(function (res) {
                    DEBUG && debug('***pictor request ', req.method, req.url, 'ok:', res.status);
                    return res.data;
                }, function (res) {
                    DEBUG && debug('***pictor request ', req.method, req.url, 'err:', status);
                    var error = (res.data && res.data.status) ? res.data : {status: res.status, message: String(res.data)};
                    return Q.reject(error);
                });
            }

            function upload(inputFileEl, id, prefix) {
                var url = pictorUrl('/upload');

                if (window.FormData) {
                    DEBUG && debug('FormData support! try upload via FormData');
                    var formData = new FormData();
                    formData.append('file', inputFileEl.files[0]);
                    formData.append('id', id || 'new');
                    formData.append('prefix', prefix || '');
                    //var xhr = new XMLHttpRequest();
                    //xhr.open('POST', url);
                    //xhr.send(formData);
                    var req = {
                        method: 'POST',
                        url: url,
                        data: formData,
                        headers: { 'Content-Type': undefined },
                        transformRequest: function (data) {
                            return data;
                        }
                    };
                    return http(req)
                        .then(function (result) {
                            DEBUG && debug('upload via FormData result', arguments);
                            // [ { id: '...', url: '...', file: '...' }, { ... }, ... ]
                            return result.data[0];
                        }, function (error) {
                            DEBUG && debug('upload via FormData error', arguments);
                            return error;
                        }, function (progress) {
                            DEBUG && debug('upload via FormData progress', arguments);
                            return progress;
                        });
                }

                DEBUG && debug('no FormData support! try upload via iframe!');
                var target = 'pictor_uploadTargetFrame_' + Date.now() + '_' + Math.floor(Math.random() * 10000);
                var formEl = angular.element('<form>').attr({
                    method: 'POST',
                    action: url,
                    enctype: 'multipart/form-data',
                    target: target + '_frame'
                });
                var iframeEl = angular.element('<iframe>').attr({
                    id: target,
                    name: target,
                    style: 'display:none;'
                });
                var inputIdEl = angular.element('<input>').attr({
                    type: 'hidden',
                    name: 'id',
                    value: id || 'new'
                });
                var inputPrefixEl = angular.element('<input>').attr({
                    type: 'hidden',
                    name: 'prefix',
                    value: prefix || ''
                });
                formEl.append(inputIdEl, inputPrefixEl, inputFileEl, iframeEl);

                var d = Q.defer();
                iframeEl
                    .off('**')
                    .one('error', function (event) {
                        DEBUG && debug('upload via iframe err', event);
                        formEl.remove();
                        return d.reject({status: 500});
                    })
                    .one('load', function (event) {
                        DEBUG && debug('upload via iframe ok', event);
                        try {
                            var json = iframeEl[0].contentWindow.document.getElementsByTagName('textarea')[0].value;
                            DEBUG && debug('upload via iframe result', json);
                            var data = JSON.parse(json);
                            return d.resolve(data[0]);
                        } catch (e) {
                            DEBUG && debug('upload via iframe - cannot access result!', e);
                            return d.reject({status: 500});
                        } finally {
                            formEl.remove();
                        }
                    });
                formEl.submit();
                return d.promise;
            }

            // TODO: function uploadRaw(url, id, prefix, options) { }

            function uploadUrl(url, id, prefix, options) {
                options = angular.extend(options, {id: id || 'new', prefix: prefix || '', url: url});
                return _request('GET', '/' + id + '?' + encodeQueryString(options));
            }

            function download(id, options) {
                return _request('GET', '/' + id, options);
            }

            function destroy(id) {
                return _request('DELETE', '/' + id);
            }

            function convert(id, converter, options) {
                return _request('POST', '/convert', angular.extend({id: id, converter: converter}, options));
            }

            function convertAndDownload(id, converter, options) {
                return _request('GET', '/convert', null, angular.extend({id: id, converter: converter}, options));
            }

            function meta(id) {
                return convertAndDownload(id, 'meta');
            }

            function exif(id) {
                return convertAndDownload(id, 'exif');
            }

            function getDownloadUrl(id, options) {
                return pictorUrl('/' + id, options);
            }

            function getConvertUrl(id, converter, options) {
                options = angular.extend({id: id, converter: converter}, options);
                return pictorUrl('/convert', options);
            }

            function getConverters() {
                return _request('GET', '/info/converters');
            }

            function getPresets() {
                return _request('GET', '/info/presets');
            }

            return {
                upload: upload,
                uploadUrl: uploadUrl,
                download: download,
                destroy: destroy,
                convert: convert,
                convertAndDownload: convertAndDownload,
                meta: meta,
                exif: exif,
                getDownloadUrl: getDownloadUrl,
                getConvertUrl: getConvertUrl,
                getConverters: getConverters,
                getPresets: getPresets
            };
        }
    ]);

    module.filter('pictorUrl', [
        'pictor',
        function (pictor) {
            return function (id) {
                return pictor.getDownloadUrl(id);
            };
        }
    ]);

    module.directive('pictorSrc', [
        'pictor',
        function (pictor) {
            return {
                priority: 980,
                link: function (scope, element, attrs) {
                    attrs.$observe('pictorSrc', function (id) {
                        element.attr('src', pictor.getDownloadUrl(id));
                    });
                }
            };
        }
    ]);

    module.directive('pictorBackground', [
        'pictor',
        function (pictor) {
            return {
                priority: 980,
                link: function (scope, element, attrs) {
                    attrs.$observe('pictorBackground', function (id) {
                        element.css('background-image', 'url(' + pictor.getDownloadUrl(id) + ')');
                    });
                }
            };
        }
    ]);

}(angular));
