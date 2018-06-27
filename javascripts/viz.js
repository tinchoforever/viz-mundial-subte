(
  function() {
  var monthNames = ["Ene", "Feb", "Mar", "Abr", "May", "Jun",
    "Jul", "Ago", "Sep", "Oct", "Nov", "Dic"
  ];

  // Check breakpoint
  function breakCalc(x){
    x <= 480 ? y = 'xs' : y = 'md';
    return y;
  }

  var breakpoint = breakCalc($('.viz').width());

  $(window).resize(function(){
    var breakpoint = breakCalc($('.viz').width());
  });


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
  var tooltipMap = d3.select("body div.map-tip");

  d3.xml("images/mapa.svg").mimeType("image/svg+xml").get(function(error, xml) {
        if (error) throw error;
        d3.select('.map').node().appendChild(xml.documentElement);
        d3.select('.map svg')
          .attr('width','100%')
          .attr('height','550px');

        d3.selectAll('.map svg .linea circle')
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
                var currentValue = selectedEstaciones.filter(function(d) { return d.estacion === nombreEstacion[0].ESTACION});  

                 console.log(currentValue,subteColor[nombreEstacion[0].LINEA]);

              }
                else {
                  console.log(id, 'no-value');
                }
  }

    var showGraphTooltip = function(linea,hora,valor,mes){
              tooltipGraph
                .html( function(){
                  var div =  ""
                  if (!linea) linea = 0;
                  if (!mes) mes = 0;

                  if(linea !=0){
                    div += "<div class='key'><div style='background:" + subteColor[linea] + "' class='swatch'></div> <span class='year'> Linea "+ linea + " a las</span>";
                  }else{
                    div += "<span class='year'> Todas las lÃ­neas a las</span>";
                  }
                  if(mes!=0) div += " ("+ meses[mes] + ")"

                  div += " "  + hora + "hs: </span> <span class='value'>" + formatMiles(valor) + " personas " + "</div>" ;
                  return div;
                })
                .style("visibility", "visible");
                
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
      g = stream.enter();

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
        //     showGraphTooltip(d.key,f.date.getHours(),f.value);
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

    // d3.select(".viz")
    //     .on("mousemove", function(){
    //        mousex = d3.mouse(this);
    //        mousex = mousex[0] + 5;
    //        vertical.style("left", mousex + "px" )})
    //     .on("click", function(){
    //        mousex = d3.mouse(this);
    //        mousex = mousex[0] + 5;
    //        vertical.style("left", mousex + "px" )})
    //     .on("mouseover", function(){
    //        mousex = d3.mouse(this);
    //        mousex = mousex[0] + 5;
    //        vertical.style("left", mousex + "px")});

    // // Add 'curtain' rectangle to hide entire graph
    // var curtain = svg.append('rect')
    //  .attr('x', -1 * width)
    //  .attr('y', -1 * height)
    //  .attr('height', height)
    //  .attr('width', width)
    //  .attr('class', 'curtain')
    //  .attr('transform', 'rotate(180)')
    //  .style('fill', '#fcfcfc')

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

    update(molinetaHoras);

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

    $('#hora').on('input change',function(){

        $('.hora-val').html($(this).val());

        if ($('#mes').val() === '0' && $('#linea').val() === '0' ){
        update(molinetaHoras);
       }
       else if ($('#mes').val() === '0'){
          update(molinetaHoras,$('#mes').val(),$('#linea').val());
       }
       else {
         update(lineasMensual,$('#mes').val(), $('#linea').val());
       }
        

    });
    $('#mes').on('change',function(){

      if ($('#mes').val() === '0' && $('#linea').val() === '0' ){
        update(molinetaHoras);
       }
       else if ($('#mes').val() === '0'){
          update(molinetaHoras,$('#mes').val(),$('#linea').val());
       }
       else {
          update(lineasMensual,$('#mes').val(), $('#linea').val());
       }
    });


    $('#linea').on('change',function(){
      
     if ($('#mes').val() === '0' && $('#linea').val() === '0' ){
      update(molinetaHoras);
      previousLineState = 0;
     }
     else if ($('#mes').val() === '0'  && $('#linea').val() !== 'multiples' ){
        update(molinetaHoras,$('#mes').val(),$('#linea').val());
              previousLineState = $('#linea').val();

     }
     else if ($('#linea').val() !== 'multiples'){
        update(lineasMensual,$('#mes').val(), $('#linea').val());
                      previousLineState = $('#linea').val();

     }else{
      if(previousLineState) {
        update(molinetaHoras,0,0);
        previousLineState = 0;
       }
       transitionMultiples();
     }
      
    });
    
    function update(dataset,mes,linea) {
        

       
      mainDataset = dataset;

      //filter
      if (mes >0){
        mainDataset = mainDataset.filter(function(d) { 
          if (d.mes){
            return d.mes === mes;
          }
          else {
           return  d.date.getMonth() === parseInt(mes);
          }
        });
                  d3.select("#escalaNumber").text("25.000");

      }else{
                  d3.select("#escalaNumber").text("250.000");

      }
      if (linea && linea !== '0'){
        mainDataset = mainDataset.filter(function(d) { return d.group === linea});
      }

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
          
     
      
      var hora = $('#hora').val();
       if (linea && linea !== '0' && linea != "multiples"){
              
        var item = mainDataset.filter(function(d) { return d.date.getHours() === parseInt(hora)});
                // showGraphTooltip(linea,hora,item[0].price,mes);


      }else{
                var item = mainDataset.filter(function(d) { return d.date.getHours() === parseInt(hora)});

                var sumatoria = 0;
                for (var i = item.length - 1; i >= 0; i--) {
                  sumatoria += parseInt(item[i].price);
                }
                showGraphTooltip(linea,hora,sumatoria,mes);
      } 


      highlightLine(linea,mes,$('#hora').val());
                vertical.style("left", xScale(parseDate(parseInt(hora) +1+ ":01:00"))+"px")

    } // ~~~fin update


    function highlightLine(linea,mes,hora){
      //filterLine
      clearMapToolTip();
      var baseR = 18;
      // if (linea && linea !== '0'){
        
          if (mes > 0){
            selectedEstaciones = mainEstacionesMes.filter(function(d) { return d.mes === mes});
          }
          else {
            selectedEstaciones = mainEstacionesAnual;
          }
            if (hora){
              selectedEstaciones =  selectedEstaciones.filter(function(d) { 
                  if (d.hora){
                    return d.hora === hora;
                  }
                  else {
                    try {
                      return  d.date.getHours() === parseInt(hora)
                    }
                    catch(e){
                      console.log(d);
                    }
                    return false;
                  }
                
              });  
            }
            if (linea  && linea!== "0"){
              selectedEstaciones = selectedEstaciones.filter(function(d) { return d.symbol === linea})
            }

           
          var scale = 2500;


          if (!mes){ // Si esta en "total anuales"
            scale= 5000;
          }
          else {

            scale= 500;
          }


          //Tengo estaciones, ahora necesito claves.
          var selectedCircles =d3.selectAll('.map svg .linea circle');

          if (linea && linea !== "0"){
              if (mes > 0){
                  scale= 500;
                }
              else{
                scale= 5000;
              }

              selectedCircles =d3.selectAll('.map svg .linea_' + linea +  ' circle');
          }

        d3.selectAll('.map svg .linea circle').transition().duration(300)
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
          // .style("fill", function(d, i) { 
          //     var id=  d3.select(this).attr("id");
          //     var nombreEstacion = nombreEstaciones.filter(function(d) { return d.ID === id; }); 
          //     if (nombreEstacion.length > 0){  
          //      return  subteColor[nombreEstacion[0].LINEA]; 
          //     }
          //     else {
          //       return "white";
          //     }
            
          // })
          .attr('r', function(d){
            var id=  d3.select(this).attr("id");
            var nombreEstacion = nombreEstaciones.filter(function(d) { return d.ID === id; }); 
            if (nombreEstacion.length > 0){  
              var currentValue = selectedEstaciones.filter(function(d) { return d.estacion === nombreEstacion[0].ESTACION});  
               if (currentValue.length > 0){ 
                if(nombreEstacion[0].ESTACION == "PASCO"){
                    var valorAlberti = selectedEstaciones.filter(function(d) { return d.estacion =="ALBERTI"});
                    return (valorAlberti[0].value + currentValue[0].value)*10/scale;
                } else{
                  return (currentValue[0].price+0)/scale;
                }

                
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


  var prepareData = function(dataToConvert){
        //load
         dataToConvert.forEach(function(z) {
          z.price = parseFloat(z.price);
          z.group = z.symbol;
          if (z.date){
            z.date = parseDate(z.date);
          }
          z.value = +z.price;
          z.mes = z.mes;
          if (z.estacion){
            z.estacion = z.estacion.toUpperCase();
          }
          // if(d.hasOwnProperty("estacion")){
          //   if(d.estacion == "PASCO"){
          //     console.log(d.estacion);
          //   }
          // }
        });




        dataToConvert.sort(function(a, b) {
           return d3.descending(a.group,b.group) || a.date - b.date;
        });
        return dataToConvert;
  };

 var mainEstaciones, molinetaHoras,mainEstacionesAnual,lineasMensual, nombreEstaciones, selectedEstaciones;
   
  var init = function(currentYear){
   
   d3.csv("data/"+currentYear+"/estaciones-all.csv", function(error, estaciones) {
        mainEstacionesMes  = prepareData(estaciones);
        d3.csv("data/"+currentYear+"/estaciones_anual.csv", function(error, dataMainEstacionesAnual) {
          mainEstacionesAnual = prepareData(dataMainEstacionesAnual);

          d3.csv("data/"+currentYear+"/molinetes_hora.csv", function(error, dataMolinetaHoras) {
                  molinetaHoras  = prepareData(dataMolinetaHoras);
                  loadDataset(molinetaHoras);
           });
        });
   });

    d3.csv("data/"+currentYear+"/molinetes_hora_mes.csv",function(error, dataLineasMensual) {
        lineasMensual = prepareData(dataLineasMensual);
   });

   
   d3.csv("data/"+currentYear+"/molinetes_hora_anual.csv", function(error, dataDatasetAnual) {
    datasetAnual = prepareData(dataDatasetAnual);
   });
   d3.csv("data/"+currentYear+"/nombre-estaciones.csv", function(error, dataNombreEstaciones) {
    nombreEstaciones = dataNombreEstaciones;
   });
  };

  init(2018);

  $('#yearSet').on('change',function(){
    var year = $(this).val();
    init(year);
  })
})();




 // Check breakpoint
function breakCalc(x){
  x <= 480 ? y = 'xs' : y = 'md';
  return y;
}

var breakpoint = breakCalc($(window).width());

$(window).resize(function(){
  var breakpoint = breakCalc($(window).width());
})
