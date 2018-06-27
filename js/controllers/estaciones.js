'use strict';
angular.module('initApp')
  .controller('estacionesController', function ($scope, $rootScope,$timeout, $location, statsService) {


	$scope.changeOption = function(){
		
		

    };
      $scope.series = ['Meses'];
       $scope.datasetOverride = [{ yAxisID: 'y-axis-1' }];
  	$scope.options = {
  		maintainAspectRatio: true,
    	scales: {
      yAxes: [
        {
          id: 'y-axis-1',
          type: 'linear',
          display: true,
          position: 'left'
        }
      ]
    }
  };
   
 	$scope.setColorFor = function(linea,mes){

 		var y= linea.years[$scope.selectedYear.opts];
 		var c = "#FFFFF";
 		if (y){
	 		for (var i = 0; i < y.months.length; i++) {
	 			var m = y.months[i];
	 			if (m.key === mes.key){
	 				c = y.color(m.values.length);
	 				break;
	 			}
	 		};
 		}
 		return c;
 		
 	}
 	$scope.getValueFor = function(linea,mes){
 		var y= linea.years[$scope.selectedYear.opts];
 		var c = 0;
 		if (y){
 		
	 		for (var i = 0; i < y.months.length; i++) {
	 			var m = y.months[i];
	 			if (m.key === mes.key){
	 				c = m.values.length;
	 				break;
	 			}
	 		};
 		}
 		return c;
 	}
  
   $scope.showDetail = function(linea,mes){

 		
 
   	$scope.detailOn = true;
   	$scope.selectedLinea = linea;
   	$scope.selectedMonth = mes;
   	var y= linea.years[$scope.selectedYear.opts];
 		var m = ""
 		if (y){
	 		for (var i = 0; i < y.months.length; i++) {
	 			var m = y.months[i];
	 			if (m.key === mes.key){
	 				$scope.selectedMonth = m;
	 				break;
	 			}
	 		};
 		}
   	if (!$scope.labels){
   		$scope.labels = linea.years[$scope.selectedYear.opts].months.map(function(t){
			return t.key;
		});
   	}
		$scope.data = linea.years[$scope.selectedYear.opts].months.map(function(t){
				return t.values.length;
		});
   };
   $scope.closeDetail= function(){
   	$scope.detailOn = false;
   	$scope.selectedLinea = '';
   	$scope.selectedMes = '';
   };

  statsService.loadAll(function(){
  	$scope.$apply(function(){
  		
    	$scope.selectOptions = statsService.years.map(function(m,i){
    		return {
    			year:m,
    			opts:i
    		}
    	});
    	$scope.selectedYear = $scope.selectOptions[$scope.selectOptions.length-1];
    	
    	$scope.stats = statsService;
  	});
  });

});