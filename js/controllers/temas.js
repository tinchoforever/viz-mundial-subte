'use strict';

angular.module('initApp')
  .controller('temasController', function ($scope,$rootScope,$timeout, statsService) {
   
	$scope.changeOption = function(){
		if ($scope.selectedEstacion != 'TODAS'){
			$scope.selectLinea = 'TODAS';
		}
		else if ($scope.selectLinea != 'TODAS'){
			$scope.selectedEstacion = 'TODAS';
		}
		$scope.serve =  $scope.getFilteredData();
    $scope.all = 0;
    $scope.serve.map(function(d){
      $scope.all += d.valor;
    });
		$scope.primerosTres = $scope.serve.reverse().slice(0,3);
		$scope.ultimosTres = $scope.serve.reverse().slice(0,3);
		$scope.labels = $scope.serve.map(function(t){
			return toTitleCase(t.categoria);
		});

		$scope.data = $scope.serve.map(function(t){
			return t.valor;
		})
		
		
      $scope.setCurrentTooltipEstacion();
      reloadGraph($scope.serve);
    };

    $scope.setCurrentTooltipEstacion = function(){
    
      if ($scope.currentMapEstacion){
       $scope.getFilteredEstacion();
      }
    
    }

    $scope.$watch('currentMapEstacion', $scope.setCurrentTooltipEstacion);


    $scope.getFilteredEstacion = function(){
      $scope.currentMove = statsService.reclamosTema
      	.map(function(t,i){
  			return {
  					categoria: t.key, 
  					valor: t.values.filter(function(i){

  						var filterYear = true;
  						var filterLinea = true;
  						var filterEstacion = true; 
  						var filterTema = true;
  						if (!isNaN(parseInt($scope.selectedYear))){
  							filterYear = parseInt(i["Año"]) == $scope.selectedYear;
  						}
  						if ($scope.selectedTema != "TODOS"){
                filterTema = i["Tema"].toLowerCase().trim()  == $scope.selectedTema;
              }
							filterEstacion = i["Estación"].toUpperCase().trim()  ==  $scope.currentMapEstacion.estacion;
							filterLinea = true;
  					


  						return filterYear && filterLinea && filterEstacion && filterTema;
  					}).length
  				}
  			})
      	.sort(function(a,b){
  			return a.valor - b.valor;
  		}).reverse();
    };

    $scope.getFilteredData = function(){
      return  statsService.estaciones
      	.map(function(t,i){
  			return {
  					categoria: t.key, 
  					valor: t.values.filter(function(i){

  						var filterYear = true;
  						var filterLinea = true;
  						var filterEstacion = true; 
  					 var filterTema = true;
  						if (!isNaN(parseInt($scope.selectedYear))){
  							filterYear = parseInt(i["Año"]) == $scope.selectedYear;
  						}
              if ($scope.selectedTema != "TODOS"){
                filterTema = i["Tema"].toLowerCase().trim()  == $scope.selectedTema;
              }
  						if ($scope.selectedLinea != "TODAS"){
  							filterLinea = i["Línea"] == $scope.selectedLinea;
  							filterEstacion = true;
  						}
  					
  						return filterYear && filterLinea && filterEstacion && filterTema;
  					}).length
  				}
  			})
      	.sort(function(a,b){
  			return a.valor - b.valor;
  		});
    };
  statsService.loadAll(function(){
  	$scope.$apply(function(){
  		$scope.reclamos =statsService;
  		$scope.selectedYear = 'TODOS';
    	$scope.selectOptions = [$scope.selectedYear].concat(statsService.years);
    	$scope.selectedLinea = 'TODAS';
    	$scope.selectLineaOptions = ['TODAS'].concat(statsService.lineas.map(function(m){
    		return m.key;
    	}).sort());
      $scope.selectedTema = "TODOS"
      $scope.selectTemaOptions = ['TODOS'].concat(statsService.reclamosTema.map(function(t){
        return(t.key);
      }).sort());
    	$scope.selectedEstacion = 'TODAS';
    	$scope.selectEstacionOption = ['TODAS'].concat(statsService.estaciones.map(function(m){
    		return m.key;
    	}).sort());
  		$timeout(function(){
        $scope.changeOption();
      },1200);
  	});
  });
});