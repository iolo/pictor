(function (angular) {
    'use strict';

    var module = angular.module('app', ['app.controllers', 'app.filters', 'app.directives', 'app.services', 'ngRoute']);

    var viewsDir = 'views';
    //var locale = (navigator.userLanguage || navigator.language);
    //if (/^(ko)/.test(locale) { viewsDir = 'views.ko'; }

    module.config(['$routeProvider', function (routes) {
        routes
            .when('/', {templateUrl: viewsDir + '/home.html'})
            .when('/docs', {templateUrl: viewsDir + '/docs/index.html'})
            .when('/docs/getting_started', {templateUrl: viewsDir + '/docs/getting_started.html'})
            .when('/docs/how_pictor_works', {templateUrl: viewsDir + '/docs/how_pictor_works.html'})
            .when('/docs/configurations', {templateUrl: viewsDir + '/docs/configurations.html'})
            .when('/docs/internals', {templateUrl: viewsDir + '/docs/internals.html'})
            .when('/console', {redirectTo: '/console/upload'})
            .when('/console/:method', {templateUrl: viewsDir + '/console/index.html', controller: 'consoleCtrl'})
            .otherwise({redirectTo: '/'});
    }]);

    module.run(['$rootScope', function (root) {
        root.viewsDir = viewsDir;
        root.apiUrl = location.protocol + '//' + location.host + '/pictor';
    }]);

    module.run(['$rootScope', '$location', function (root, loc) {
        root.$on('$routeChangeSuccess', function () {
            ga('send', 'pageview', loc.path());
        });
    }]);

}(angular));
