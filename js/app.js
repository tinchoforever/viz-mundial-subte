'use strict';

angular.module('initApp',['ngRoute', 'ngAnimate', 'gridshore.c3js.chart', 'chart.js'])
.config(['$compileProvider', function($compileProvider) {
    $compileProvider.aHrefSanitizationWhitelist(/^\s*(https?|whatsapp|file|tel):/);
  }])
.directive('onFinishRender',['$timeout', '$parse', function ($timeout, $parse) {
    return {
        restrict: 'A',
        link: function (scope, element, attr) {
            if (scope.$last === true) {
                $timeout(function () {
                    scope.$emit('ngRepeatFinished');
                    if(!!attr.onFinishRender){
                      $parse(attr.onFinishRender)(scope);
                    }
                });
            }
        }
    }
}])
  .config(function ($routeProvider) {
    $routeProvider
      .when('/principal', {
        templateUrl: 'views/principal.html',
        controller: 'mainController'
      })
      .when('/estaciones', {
        templateUrl: 'views/estaciones.html',
        controller: 'estacionesController'
      })
      .when('/temas', {
        templateUrl: 'views/temas.html',
        controller: 'temasController'
      })
      .when('/', {
        templateUrl: 'views/ponderado.html',
        controller: 'ponderadoController'
      })
      
});
 
new WOW().init();
              
/**
 * Returns a random number between min (inclusive) and max (exclusive)
 */
function getRandomArbitrary(min, max) {
    return Math.random() * (max - min) + min;
}

/**
 * Returns a random integer between min (inclusive) and max (inclusive)
 * Using Math.round() will give you a non-uniform distribution!
 */
function getRandomInt(min, max) {
    return Math.floor(Math.random() * (max - min + 1)) + min;
}

function shuffle(array) {
  var currentIndex = array.length, temporaryValue, randomIndex;

  // While there remain elements to shuffle...
  while (0 !== currentIndex) {

    // Pick a remaining element...
    randomIndex = Math.floor(Math.random() * currentIndex);
    currentIndex -= 1;

    // And swap it with the current element.
    temporaryValue = array[currentIndex];
    array[currentIndex] = array[randomIndex];
    array[randomIndex] = temporaryValue;
  }

  return array;
}
function toTitleCase(str) {
    return str.replace(
        /\w\S*/g,
        function(txt) {
            return txt.charAt(0).toUpperCase() + txt.substr(1).toLowerCase();
        }
    );
}