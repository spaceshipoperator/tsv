var od = 1000*60*60*24; 

Array.max = function( array ){
    return Math.max.apply( Math, array );
};

Array.min = function( array ){
    return Math.min.apply( Math, array );
};

var dateToStr = function (d) {
  var y = d.getFullYear().toString(),
    m = '0' + (d.getMonth() +1).toString(),
    s = '0' + d.getDate().toString();
    return y + '-' + m.substring(m.length - 2) + '-' + s.substring(s.length - 2);
};

function plotSeries(series, config) {
  var 
    // series boundaries
    bounds = series.pop(), 

    // padding for the graphics
    padding = 20,

    // bar graph width (will be added to sWidth to determine svg width)
    bWidth = 150,

    // scatterplot dimensions and scale 
    sWidth = 650,
    sHeight = 400,

    sXMin = bounds['seriesMin']['x'],
    sXMax = bounds['seriesMax']['x'],

    sYMin = bounds['seriesMin']['yLeft'],
    sYMax = bounds['seriesMax']['yLeft'],

    sRMin = bounds['seriesMin']['yRight'],
    sRMax = bounds['seriesMax']['yRight'],

    sXScale = d3.scale.linear().domain([sXMin, sXMax]).range([0, sWidth]),
    sYScale = d3.scale.linear().domain([sYMin, sYMax]).range([sHeight, 0]),
    sRScale = d3.scale.linear().domain([sRMin, sRMax]).range([sRMin, sRMax]),

    sXLabels = config['xLabels']['value'].split(','),
    sXLScale = d3.scale.ordinal().domain(sXLabels).rangePoints([0, sWidth]),

    sColors = d3.scale.category10(),

    // extracting the date for display
    dateParts = config.asOfDate.value.split('-').map(Number),
    selectedDate = new Date(dateParts[0], dateParts[1] - 1, dateParts[2]),

    sTitle = d3.select("body")
      .append("h3")
      .text(selectedDate.toDateString())
      .attr("align", "center"),

    svg = d3.select("body")
      .append("svg:svg")
      // may append the width of the bar graph too
      .attr("width", sWidth + bWidth + padding * 4)
      .attr("height", sHeight + padding * 2)
      .append("svg:g")
      .attr("transform", "translate(" + padding + "," + padding + ")"),

    vRules = svg.selectAll("g.vrule")
      .data(sXLabels)
      .enter().append("svg:g")
      .attr("class", "rule"),

    hRules = svg.selectAll("g.hrule")
      .data(sYScale.ticks(20))
      .enter().append("svg:g")
      .attr("class", "rule");

  vRules.append("svg:line")
    .attr("x1", sXLScale)
    .attr("x2", sXLScale)
    .attr("y1", 0)
    .attr("y2", sHeight - 1);

  vRules.append("svg:text")
    .attr("x", sXLScale)
    .attr("y", sHeight + 3)
    .attr("dy", "1.71em")
    .attr("text-anchor", "start")
    .text(function(d,i) { return d; });

  hRules.append("svg:line")
    .attr("y1", sYScale)
    .attr("y2", sYScale)
    .attr("x1", 0)
    .attr("x2", sWidth + 1);

  hRules.append("svg:text")
    .attr("y", sYScale)
    .attr("x", -3)
    .attr("dy", ".35em")
    .attr("stroke", "grey")
    .attr("text-anchor", "end")
    .text(sYScale.tickFormat(10));

  series = series.sort(function(p,n) {
    var r = 0;  
    if (p.seriesKey < n.seriesKey)
      r = -1;
    if (p.seriesKey > n.seriesKey)
      r = 1;
    return r;
  });
  
  function toggleVisible(di) {
    var selectedCircles = svg.selectAll(".circle" + di),
      selectedRects = svg.selectAll(".rect" + di), 
      newRectFill = "";

    selectedCircles.attr("opacity", function(d,i) {
      var newOpacity;
      d.v = (d.v == true ? false : true);
      if (d.v) {
        newOpacity = .4;
        newRectFill = sColors(d.i);
      } else {
        newOpacity = 0;  
        newRectFill = "none";
      }
      return newOpacity;
    });

    selectedRects.attr("fill", newRectFill);
  }

  // throwing this in a function so we can call it for each day
  function plotDay() {
    sTitle.text(selectedDate.toDateString());

    // clean up what follows
    var a = series.map(function() {return 0;});
    
    var t = [];
  
    series.map(function(e,i){
      e.data.map(function(o){
        if (o.yLeft_1 > 0  && o.yRight_1 > 0 && o.xTime.split(' ')[0] == dateToStr(selectedDate)) {
          a[i] = a[i] + o.yRight_2;
          o.i = i;
          o.a = a[i];
          o.v = true;
          t.push(o);
        }
      });
    });

    var data = t.sort(function(p,n) {
      var r = 0;
      if (p.x < n.x)
         r = -1;
      if (p.x > n.x)
        r = 1;
      return r;
    });
  
    // plot the initial set of circles
    var circle = svg.selectAll("circle")
      .data(data)
      .enter().append("svg:circle")
      .attr("class", function(d,i) { return "circle" + d.i; })
      .attr("fill", function(d,i) {return sColors(d.i);})
      .attr("opacity", .30)
      .attr("cx", function(d,i) {return sXScale(d.x);})
      .attr("cy", function(d,i) {return sYScale(d.yLeft_1);})
      .attr("r", function(d,i) {return sRScale(4 + (d.yRight_1 * 2));});
  
    // bolt on a bar graph
    var
      bXMax = Array.max(a),
      bXScale = d3.scale.linear().domain([0, bXMax]).range([0, bWidth]),
      bYScale = d3.scale.ordinal().domain(d3.range(series.length)).rangeBands([sHeight/8, sHeight - sHeight/8], .8);
  
    var barLabels = svg.selectAll("g.barLabels")
      .data(series)
      .enter().append("svg:text")
      .attr("class", "barText")
      .attr("transform", function(d, i) { return "translate(" + (sWidth + 3) + "," + (bYScale(i) - 5) + ")"; })
      .text(function(d,i) { return series[i]["seriesName"].replace(/"/g,''); })
      .on("click", function(d,i) { toggleVisible(i); });
  
    var bars = svg.selectAll("g.bar")
      .data(a)
      .enter().append("svg:g")
      .attr("transform", function(d, i) { return "translate(" + (sWidth + 3) + "," + bYScale(i) + ")"; });
  
    bars.append("svg:rect")
      .attr("class", function(d,i) {return "rect" + i;})
      .attr("stroke", function(d,i) {return sColors(i);})
      .attr("fill", function(d,i) { return sColors(i); })
      .attr("width",  function(d,i) { return bXScale(d); })
      .attr("height", bYScale.rangeBand());
  
    bars.append("svg:text")
      .attr("class", "barText")
      .attr("x", bXScale)
      .attr("y", bYScale.rangeBand() / 2)
      .attr("dx", -6)
      .attr("dy", ".35em")
      .attr("fill", "white")
      .attr("text-anchor", "end")
      .text(bXScale.tickFormat(10));
        
  }

  function clearPlot() {
    svg.selectAll("circle").remove();  
    svg.selectAll("g.barLabels").remove();
    svg.selectAll("g.bar").remove();
    svg.selectAll(".barText").remove();
    svg.selectAll("rect").remove();
  }
    
  plotDay();

  d3.select(window).on("keydown", function() {
    //alert(d3.event.keyCode);
    switch (d3.event.keyCode) {
      case 37: selectedDate = new Date(selectedDate.getTime() - od) ; break;
      case 39: selectedDate = new Date(selectedDate.getTime() + od) ; break;
    }
    clearPlot();
    plotDay();
  });

}
