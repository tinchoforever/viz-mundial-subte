'use strict';

angular.module('initApp')
  .controller('mainController', function ($scope, $rootScope, $location, statsService) {
 
  statsService.loadAll(function(){
  	$scope.$apply(function(){
  		$scope.reclamos =statsService;
  	});
  });
 
    	


}).directive('onFinishRender', function($timeout) {
    return {
      restrict: 'A',
      link: function(scope, element, attr) {
        if (scope.$last === true) {
          $timeout(function() {
            scope.$emit(attr.onFinishRender);
          });
        }
      }
    }
  });