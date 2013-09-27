(function (module) {
  'use strict';

  module.controller('demoCtrl', ['$scope', '$routeParams', function (scope, params) {
    scope.method = params.method || 'upload';
    scope.requestViewUrl = scope.viewsDir + '/demo/' + scope.method + '.html';
  }]);

}(angular.module('app.controllers', [])));
