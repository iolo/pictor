(function (module) {
  'use strict';

  var viewsDir = 'views';
  //var locale = (navigator.userLanguage || navigator.language);
  //if (/^(ko)/.test(locale) { viewsDir += locale.substring(0, 2); }

  module.config(['$routeProvider', function (routes) {
    routes
      .when('/', {templateUrl: viewsDir + '/home.html'})
      .when('/docs', {templateUrl: viewsDir + '/docs/index.html'})
      .when('/docs/getting_started', {templateUrl: viewsDir + '/docs/getting_started.html'})
      .when('/docs/how_pictor_works', {templateUrl: viewsDir + '/docs/how_pictor_works.html'})
      .when('/docs/configurations', {templateUrl: viewsDir + '/docs/configurations.html'})
      .when('/docs/internals', {templateUrl: viewsDir + '/docs/internals.html'})
      .when('/demo', {redirectTo: '/demo/upload'})
      .when('/demo/:method', {templateUrl: viewsDir + '/demo/index.html', controller: 'demoCtrl'})
      .otherwise({redirectTo: '/'});
  }]);

  module.run(['$rootScope', function (root) {
    root.viewsDir = viewsDir;
    root.apiUrl = 'http://localhost:3001/pictor';
  }]);

}(angular.module('app', ['app.controllers', 'app.filters', 'app.directives', 'app.services', 'ngRoute'])));