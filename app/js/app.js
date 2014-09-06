(function (angular) {
    'use strict';

    var module = angular.module('app', [
        'ngRoute',
        'app.controllers', 'app.filters', 'app.directives', 'app.services',
        'pictor'
    ]);

    var viewsDir = 'views';
    //var locale = (navigator.userLanguage || navigator.language);
    //if (/^(ko)/.test(locale) { viewsDir = 'views.ko'; }

    module.config(['$routeProvider', function (routes) {
        routes
            .when('/', {templateUrl: viewsDir + '/home.html'})
            .when('/docs', {templateUrl: viewsDir + '/docs/index.html'})
            .when('/docs/getting_started', {templateUrl: viewsDir + '/docs/getting_started.html'})
            .when('/docs/how_pictor_works', {templateUrl: viewsDir + '/docs/how_pictor_works.html'})
            .when('/docs/pictor_for_angularjs', {templateUrl: viewsDir + '/docs/pictor_for_angularjs.html'})
            .when('/docs/configurations', {templateUrl: viewsDir + '/docs/configurations.html'})
            .when('/docs/internals', {templateUrl: viewsDir + '/docs/internals.html'})
            .when('/console', {redirectTo: '/console/upload'})
            .when('/console/:method', {templateUrl: viewsDir + '/console/index.html', controller: 'consoleCtrl'})
            .otherwise({redirectTo: '/'});
    }]);

    module.value('pictor.config', {
        PICTOR_ENDPOINT: location.protocol + '//' + location.host + '/api/v1'
    });

    module.run(['$rootScope', 'pictor.config', 'pictor', function (root, pictorConfig, pictor) {
        root.viewsDir = viewsDir;
        root.apiUrl = pictorConfig.PICTOR_ENDPOINT;
        pictor.getConverters().then(function (converters) {
            root.converters = converters;
        });
        pictor.getPresets().then(function (presets) {
            root.presets = presets;
        });
    }]);

    module.run(['$rootScope', '$location', function (root, loc) {
        root.$on('$routeChangeSuccess', function () {
            ga('send', 'pageview', loc.path());
        });
    }]);

}(angular));
