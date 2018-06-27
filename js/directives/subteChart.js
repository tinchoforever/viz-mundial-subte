'use strict';

angular.module('initApp')
.directive('subteChart', function() {
    return {
        restrict: 'E',
        replace: false,
        scope: {
          container: '=container',
          data: '=lines'
        },
        controller: function($scope, $http) {

          $scope.id = $scope.container + '-directive'
          $scope.chart = null;

          function render(){

              console.log('render');
              console.log($scope.data);
              reRender($scope.id, $scope.container);
          }

          setTimeout(function(){
            render();
          },1000);

          var id;
          $(window).resize(function() {
            clearTimeout(id);
            id = setTimeout(function(){
              if($scope.chart){
                render();

              }
            }, 500);
    });


        }, 
        template: '<div id="{{id}}"></div>'
    };

});



var reRender = function(renderId){
  var mainDataset,selectedEstaciones, selectedCircles;
  var monthNames = ["Ene", "Feb", "Mar", "Abr", "May", "Jun",
    "Jul", "Ago", "Sep", "Oct", "Nov", "Dic"
  ];

  // // Check breakpoint
  // function breakCalc(x){
  //   x <= 480 ? y = 'xs' : y = 'md';
  //   return y;
  // }

  // var breakpoint = breakCalc($('.viz').width());

  // $(window).resize(function(){
  //   var breakpoint = breakCalc($('.viz').width());
  // });


  var filterNames = ["5h a 8h", "8h a 12h", "12h a 16h", "16h a 20h", "20h a 23h"];

  var meses = ['', 'Enero', 'Febrero', 'Marzo', 'Abril','Mayo','Junio','Julio','Agosto','Septiembre','Octubre','Noviembre','Diciembre'];

  var actualLineState, previousLineState;

  var parseDate = d3.time.format("%H:%M:%S").parse,
      formatYear = d3.format("02d"),
      formatDate = function(d) { return d.getHours()+'h'; };


      function formatMiles(x) {
  return x.toString().replace(/\B(?=(\d{3})+(?!\d))/g, ".");
}
  

  var margin = {top: 50, right: 20, bottom: 25, left: 30},
      width = $('.viz').width() - margin.left - margin.right,
      height = 530 - margin.top - margin.bottom,
      lineHeight = height-50;

  var yScaleStacked = d3.scale.linear().range([height, 0]),
      yScaleMultiples = d3.scale.linear().range([height, 0]),
      xScale = d3.time.scale().rangeRound([0, width]),
      colorScale = d3.scale.ordinal().range(colorbrewer.Blues[5].reverse());

  var subteColor = {
            'A': "rgb(0, 174, 219)",
            'B': "rgb(238, 27, 46)",
            'C': "rgb(1, 103, 178)",
            'D': "rgb(0, 128, 103)",
            'E': "rgb(108, 33, 128)",
            'H': "rgb(255, 210, 3)"
  };
 
  var xAxis = d3.svg.axis()
      .scale(xScale)
      .orient("bottom")
      .ticks(d3.time.hours, 3)
      .tickFormat(formatDate);
      
  var stack = d3.layout.stack()
      .offset("wiggle")
      .values(function(d) { return d.values; })
      .x(function(d) { return d.date; })
      .y(function(d) { return d.value; });
      
  var nest = d3.nest()
      .key(function(d) { return d.group; });

  var areaStacked = d3.svg.area()
      .interpolate("cardinal")
      .x(function(d) { return xScale(d.date); })
      .y0(function(d) { return yScaleStacked(d.y0); })
      .y1(function(d) { return yScaleStacked(d.y0 + d.y); });

  var areaMultiples = d3.svg.area()
      .interpolate("cardinal")
      .x(function(d) { return xScale(d.date); })
      .y0(function(d) { return lineHeight; })
      .y1(function(d) { return yScaleMultiples(d.value); });

  var svg = d3.select(".viz").append("svg")
      .attr("width", width + margin.left + margin.right)
      .attr("height", height + margin.top + margin.bottom)
    .append("g")
      .attr("transform", "translate(" + margin.left + "," + 20 + ")");
  


  var tooltipGraph = d3.select("body div.viz-tip");
  var tooltipMap = d3.select("body div#" + renderId + "-tip");

  d3.xml("images/mapa.svg").mimeType("image/svg+xml").get(function(error, xml) {
        if (error) throw error;
        d3.select("#" + renderId).node().appendChild(xml.documentElement);
        d3.select("#" + renderId + " svg")
          .attr('width','100%')
          .attr('height','550px');

        d3.selectAll("#" + renderId + " svg .linea circle")
          .on('click', renderMapTooltip)
          .on('mouseover',renderMapTooltip)
          .on('mouseout',function(d){    d3.select(this).style("stroke-width","12px");});
  });

  var clearMapToolTip = function(){
    tooltipMap.html("").style("visibility","hidden");

  }


  var renderMapTooltip = function(){
    d3.select(this).style("stroke-width","24px");
      var id=  d3.select(this).attr("id");
            var nombreEstacion = nombreEstaciones.filter(function(d) { return d.ID === id; }); 
              if (nombreEstacion.length > 0){  
                var currentValue = selectedEstaciones.filter(function(d) { 
                   var result = d.estacion === nombreEstacion[0].ESTACION;
                  return result;});  
                var $scope = angular.element(document.getElementById('reclamos')).scope();
                $scope.$apply(function(){
                  $scope.currentMapEstacion = currentValue[0]
                  $scope.currentMapEstacion.color = subteColor[nombreEstacion[0].LINEA];
                  $scope.currentMapEstacion.linea = nombreEstacion[0].LINEA;
                });

               
              }
  };

    var showGraphTooltip = function(linea,hora,valor,mes){
             
                
          };
  var mainDataset,stream;
  var loadDataset= function(data){




    
     mainDataset = data;

   
    var nested = nest.entries(mainDataset);
    var layers = stack(nested);
    lineHeight = height / nested.length;
    
    xScale.domain(d3.extent(data, function(d) { return d.date; }));
    yScaleStacked.domain([0, d3.max(data, function(d) { return d.y0 + d.y; })]);
    yScaleMultiples.domain([0, d3.max(data, function(d) { return d.value; })]).range([lineHeight, 0]);
    
    svg.insert("g")
        .attr("class", "x axis")
        .attr("transform", "translate(0," + (height + 10) + ")")
        .call(xAxis);



    var stream  = svg.selectAll(".group")
        .data(layers);
    var  g = stream.enter();

      var group  = g.append("g");

    group.attr("class", "group")
        .attr("id", function(d){ return d.key})
        .attr('transform', function(d, i){ return "translate(0," + (height - (i+1) * lineHeight) +")"; });


    
    group.append("path")
        .attr("class", "layer")
        .attr("d", function(d) { return areaMultiples(d.values); })
        .style("fill", function(d, i) { return  subteColor[d.key]; })
        ;


    /* Exit */
    stream.exit().remove();



     // user interaction with the layers
    svg.selectAll(".layer")
      .attr("opacity", 1)
      .on("mouseover", function(d, i) {
      //   svg.selectAll(".layer").transition()
      //     .duration(100)
      //     .attr("opacity", function(d, j) {
      //       return j != i ? 0.6 : 1;
      // })
        })
      .on("mousemove", function(d, i) {

        // var color = d3.select(this).style('fill'); // need to know the color in order to generate the swatch

        // mouse = d3.mouse(this);
        // mousex = mouse[0];
        // var invertedx = xScale.invert(mousex);
        // var xDate = invertedx.getHours();
        // d.values.forEach(function(f){
        //   var h = f.date.getHours();
        //   if (xDate == h){

        //     highlightLine(d.key,$('#mes').val(), f.date.getHours());
        //     xrfshowGraphTooltip(d.key,f.date.getHours(),f.value);
        //   }
        // });
      })
      .on("mouseout", function(d, i) {
        // svg.selectAll(".layer").transition()
        //   .duration(100)
        //   .attr("opacity", '1');
        // tooltipGraph.style("visibility", "hidden");


      




    });

    // vertical line to help orient the user while exploring the streams
    var vertical = d3.select(".viz")
          .append("div")
          .attr("class", "lineaVertical")
          .style("position", "absolute")
          .style("z-index", "19")
          .style("width",  (xScale(parseDate("7:00:00"))-xScale(parseDate("6:00:00"))) +  "px")
          .style("height", height *1.06  +  "px")
          .style("top", margin.top + "px")
          .style("left", (xScale(parseDate("15:00:00")))+"px")
          .style("background", "rgba(247, 247, 247, 0.59");


    // Create a shared transition for anything we're animating
    var t = svg.transition()
     .delay(100)
     .duration(1500)
     .ease('exp')
     .each('end', function() {
       d3.select('line.guide')
         .transition()
         .style('opacity', 0)
         .remove();
     });

    // t.select('rect.curtain')
    //   .attr('width', 0);
    // t.select('line.guide')
    //   .attr('transform', 'translate(' + width + ', 0)');

    update(mainDataset);

    d3.selectAll('g.tick')
      .select('line') //grab the tick line
      .attr('y1', -1.05*height )
      .attr('class', 'quadrantBorder') //style with a custom class and CSS
      .style('stroke-width', 1); //or style directly with attributes or inline styles

    function change() {

      if (('#linea').val() === 'multiples'){
         transitionMultiples();
         
      }
      else {
         transitionStacked();
      }
      
    }

    function update() {
        

       
      

      
      

      
      //prepareStream
      var filtered = mainDataset;
      var nested = nest.entries(filtered);
      var layers = stack(nested);
      


       xScale.domain(d3.extent(mainDataset, function(d) { return d.date; }));
       yScaleStacked.domain([0, d3.max(mainDataset, function(d) { return d.y0 + d.y; })]);
       yScaleMultiples.domain([0, d3.max(mainDataset, function(d) { return d.value; })]).range([lineHeight, 0]);
    
    // //hideStream
      d3.selectAll(".layer")
        .transition()
          .duration(300)
          .style("display","none");

     
          //drawNetStream
      d3.selectAll(".layer")
        .data(layers)
        .transition()
          .duration(750)
          .style("display","block")
          .style("fill", function(d, i) { return  subteColor[d.key]; })
          .attr("d", function(d) { return areaStacked(d.values); });

       var t = svg.transition().duration(300),
          g = t.selectAll(".group").attr('transform', function(){ return "translate(0,0)"; });
          
     
      
      
      // showGraphTooltip(linea,hora,sumatoria,mes);
      highlightLine(0);
                // vertical.style("left", xScale(parseDate(parseInt(hora) +1+ ":01:00"))+"px")

    } // ~~~fin update


    function highlightLine(linea){
      //filterLine
      clearMapToolTip();
      var baseR = 2;
          
            selectedEstaciones = mainDataset;


           
          var scale = 5;
          d3.select("#escalaNumber").text("25.000");


          //Tengo estaciones, ahora necesito claves.
          var selectedCircles =d3.selectAll("#" + renderId + " svg .linea circle");

          if (linea && linea !== "0"){
              selectedCircles =d3.selectAll("#" + renderId + "  svg .linea_" + linea +  " circle");
          }

        d3.selectAll("#" + renderId + "  svg  .linea circle").transition().duration(300)
          .style("fill", function(d, i) { return  "transparent"; })
          .style("stroke-opacity", 0.1)
          .attr('r', function(d){
          return baseR;
        });
        selectedCircles
          .transition()
          .duration(300)
          .style("fill", function(d, i) { return  "white"; })
          .style("stroke-opacity", 1)
          .attr('r', function(d){
            var id=  d3.select(this).attr("id");
            var nombreEstacion = nombreEstaciones.filter(function(d) { return d.ID === id; }); 
            if (nombreEstacion.length > 0){  
              var currentValue = selectedEstaciones.filter(function(d) { 
                var result =  d.estacion === nombreEstacion[0].ESTACION
                return result ;
              });  
               if (currentValue.length > 0){ 
                // if(nombreEstacion[0].ESTACION == "PASCO"){
                //     var valorAlberti = selectedEstaciones.filter(function(d) { return d.estacion =="ALBERTI"});
                //     return (valorAlberti[0].value + currentValue[0].value)*10/scale;
                // } else{
                  return (currentValue[0].price+0)/scale;
                

                
              }
              else {
                return baseR*2;  
              }
            }else {
              // Multiplying the value by 4 is mucking up the result area maybe but the results might be proportional to data w/out it
              return baseR*2;
            }

        });


      
      
    }
    function transitionMultiples() {
      var t = svg.transition().duration(750),
          g = t.selectAll(".group").attr('transform', function(d, i){ return "translate(0," + (height - (i+1) * lineHeight) +")"; });
      g.selectAll(".layer").attr("d", function(d) { return areaMultiples(d.values); });

      
    }

    function transitionStacked() {
      var t = svg.transition().duration(750),
          g = t.selectAll(".group").attr('transform', function(){ return "translate(0,0)"; });
      g.selectAll(".layer").attr("d", function(d) { return areaStacked(d.values); });
      
    }
    function tipX(x){
      var winWidth = $(window).width();
      var tipWidth = $('.tip').width();
      if (breakpoint == 'xs'){
        x > winWidth - tipWidth - 20 ? y = x-tipWidth : y = x;
      } else {
        x > winWidth - tipWidth - 30 ? y = x-45-tipWidth : y = x+10;
      }
      return y;
    }





  }

  window.reloadGraph = function(data){
    mainDataset = prepareData(data);
    loadDataset(data);
  }
  var prepareData = function(dataToConvert){
        //load
         dataToConvert.forEach(function(z) {
          z.price = parseFloat(z.valor);
          // z.group = z.symbol;
          z.value = +z.price;
          if (z.categoria){
            z.estacion = z.categoria.toUpperCase();
          }
        });
        return dataToConvert;
  };

  var nombreEstaciones;
  var init = function(currentYear){
   d3.csv("data/nombre-estaciones.csv", function(error, dataNombreEstaciones) {
    nombreEstaciones = dataNombreEstaciones;
    
   });
  };

  init(2018);

  $('#yearSet').on('change',function(){
    var year = $(this).val();
    init(year);
  })

}


