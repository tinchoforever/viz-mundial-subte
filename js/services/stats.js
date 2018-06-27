'use strict';

/* Filters */
angular.module('initApp').factory('statsService', function($http, $filter) {

	var factory = {

		subteColors: {
            'A': {r: 0, g:174, b:219},
            'B': {r: 238, g:47, b:46},
            'C': {r: 1, g:103, b:178},
            'D': {r: 0, g:128, b:103},
            'E': {r: 108, g:33, b:128},
            'H': {r: 255, g:210, b:3},
            'P': {r: 255, g:210, b:3},
            "Sin Especificar": {r: 255, g:210, b:3},
         },
		loadAll: function(cb){
			var file = 'reclamos.csv';
		    factory.dataset = [];
		    factory.tipos = [];
		    factory.all = [];
		    factory.years = [2014, 2015, 2016, 2017];
		    
		    async.each(factory.years, function(z, callback) {
		    	var url = 'data/' + z+ '/' + file;
		      	d3.csv(url, function(data){
		      		console.log(data.length);
		      		   		factory.dataset.push({
			      			year:z,
			      			data:data
			      		});	
			      		factory.all = factory.all.concat(data);
			  		callback();
				});
			  // return year;
			}, function(results, err) {
			    
   	    		factory.reclamosTema = d3.nest()
		        .key(function(d) {
		          d.Tema = d.Tema.toLowerCase().trim();
		          return d.Tema;
		        })
		        .entries(factory.all);


				factory.subtemas = d3.nest()
		        .key(function(d) {
		          d["Sub Tema"] = d["Sub Tema"].toLowerCase().trim().replace('- subte','').trim();
		          return d["Sub Tema"];
		        })
		        .entries(factory.all);

		  
		        factory.estaciones = d3.nest()
			        .key(function(d) {
			          return d["Estación"].toLowerCase().trim();
			        })
			        .entries(factory.all);
		 		factory.lineas = d3.nest()
			        .key(function(d) {
			        	if (!d['Línea']){
			        		console.log('no linea', d);
			        	}
			        	else {
			        		d['Línea'] = d['Línea'].replace('LINEA','').trim();
			        		
			        	}
			          
			          return d['Línea'];
			        })
		        .entries(factory.all);

		        factory.lineas = factory.lineas.sort(function(a,b){
		        	    if(a.key < b.key) return -1;
					    if(a.key > b.key) return 1;
					    return 0;
		        })


		        factory.lineas.map(function(l){
		        	//year
		        	// Año,Fecha,Mes,Día de la semana,Día,Tema,Sub Tema,Línea,Estación
		        	l.years = d3
		        		.nest()
			        	.key(function(d) {
        					return d['Año'];
		        		})
		        		.entries(l.values);
		        		//MESES
			        	l.years.map(function(y){
			        		y.months = d3
			        		.nest()
				        	.key(function(d) {
	        					return d['Mes'];

			        		})
			        		.entries(y.values);
			        	//temas 
			        	var min = Math.min.apply(Math, y.months.map(function(d){return d.values.length;}))
			        	var max = Math.max.apply(Math, y.months.map(function(d){return d.values.length;}))
			        	var color = factory.subteColors[l.key];
			        	if (!color){
			        		color = {r: 255, g:210, b:3};
			        	}
			        	var subtecolor = d3.rgb(color.r,color.g, color.b);

			        	y.color = d3.scale.linear().domain([min,max])
					      .range([subtecolor, subtecolor.darker().darker()]);
		        		y.months.map(function(m){
			        		m.temas = d3.nest()
			        			.key(function(d) {
					         	 d["Sub Tema"] = d["Sub Tema"].toLowerCase().trim().replace('- subte','').trim();
		          				return d["Sub Tema"];
					        })
					        .entries(m.values);
					        //ordeno de mayor a menor
					        m.temas = m.temas.sort(function(a,b){
  								return -a.values.length+  b.values.length
  							});


		        		});




		        	});

		        });



			 	cb();
			});
		},			
	}


	return factory;
});
