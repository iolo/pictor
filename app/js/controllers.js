(function (module) {
  'use strict';

  module.controller('consoleCtrl', ['$scope', '$routeParams', function (scope, params) {
    scope.method = params.method || 'upload';
    scope.requestViewUrl = scope.viewsDir + '/console/' + scope.method + '.html';
  }]);

}(angular.module('app.controllers', [])));
