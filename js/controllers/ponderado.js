'use strict';

angular.module('initApp')
  .controller('ponderadoController', function ($scope, $rootScope,$timeout, $location, statsService) {
   $scope.options = {
        responsive: true,
        color:['#97BBCD', '#DCDCDC', '#F7464A', '#46BFBD', '#FDB45C', '#949FB1', '#4D5360']
    };
    var vm = {};
    vm.mainValues = [30,200,100,400,150,250];
    $scope.vm = vm;

    
    // $scope.datapoints = [
    //     {"x": "one", "top-1": 10, "top-2": 12},
    //     {"x": "two", "top-1": 11, "top-2": 13},
    //     {"x": "three", "top-1": 12, "top-2": 14},
    //     {"x": "four", "top-1": 13, "top-2": 15},
    //     {"x": "five", "top-1": 14, "top-2": 16}
    // ];
    // $scope.datacolumns = [{"id": "top-1", "type": "bar", "name": "Top one"},
    //     {"id": "top-2", "type": "bar", "name": "Top two"}];
    // $scope.datax = {"id": "x"};

  
	$scope.changeOption = function(){
		if ($scope.selectedEstacion != 'TODAS'){
			$scope.selectLinea = 'TODAS';
		}
		else if ($scope.selectLinea != 'TODAS'){
			$scope.selectedEstacion = 'TODAS';
		}
		$scope.serve =  $scope.getFilteredData();
		$scope.mainValues = $scope.serve.map(function(m){
      return m.valor;
    }); 
    $scope.primerosTres = angular.copy($scope.serve)
                  .sort(function(a,b){
                    return -a.valor + b.valor;
                  }).slice(0,3);
		$scope.ultimosTres = angular.copy($scope.serve)
                  .sort(function(a,b){
                    return +a.valor - b.valor;
                  }).slice(0,3);
    if (!$scope.labels){
      
      var meterColor = d3.scale.linear().domain([0,$scope.serve.length])
                .range([d3.rgb("#dcdcdc"), d3.rgb("#9c0c15")]);

		  $scope.labels = $scope.serve.map(function(t){
			  return toTitleCase(t.categoria);
		  });
      $scope.colors = $scope.serve.map(function(t,i){
        return meterColor(i);
      });

    }
		$scope.data = $scope.serve.map(function(t){
			return t.valor;
		})
		
		

    };

    $scope.getFilteredData = function(){
      return  statsService.reclamosTema
      	.map(function(t,i){
  			return {
  					categoria: t.key, 
  					valor: t.values.filter(function(i){

  						var filterYear = true;
  						var filterLinea = true;
  						var filterEstacion = true; 
  						
  						if (!isNaN(parseInt($scope.selectedYear))){
  							filterYear = parseInt(i["Año"]) == $scope.selectedYear;
  						}

  						if ($scope.selectedLinea != "TODAS"){
  							filterLinea = i["Línea"] == $scope.selectedLinea;
  							filterEstacion = true;
  						}
  						else if ($scope.selectedEstacion != "TODAS"){
  							filterEstacion = i["Estación"].toLowerCase().trim()  == $scope.selectedEstacion;
  							filterLinea = true;
  						}


  						return filterYear && filterLinea && filterEstacion;
  					}).length
  				}
  			})

    };
 	
  


  statsService.loadAll(function(){
  	$scope.$apply(function(){
  		$scope.selectedYear = 'TODOS';
    	$scope.selectOptions = [$scope.selectedYear].concat(statsService.years);
    	$scope.selectedLinea = 'TODAS';
    	$scope.selectLineaOptions = ['TODAS'].concat(statsService.lineas.map(function(m){
    		return m.key;
    	}).sort());
    	$scope.selectedEstacion = 'TODAS';
    	$scope.selectEstacionOption = ['TODAS'].concat(statsService.estaciones.map(function(m){
    		return m.key;
    	}).sort());
  		$scope.changeOption();
  	});
  });

});