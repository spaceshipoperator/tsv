Array.max = function( array ){
    return Math.max.apply( Math, array );
};

Array.min = function( array ){
    return Math.min.apply( Math, array );
};

function plotSeries(series, config) {
  var 
    // series boundaries
    bounds = series.pop(), 

    // extracting the date for display
    dateParts = config.fromDate.value.split('-').map(Number),
    dateString = new Date(dateParts[0], dateParts[1] - 1, dateParts[2]).toDateString(),

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

    sTitle = d3.select("body")
      .append("h3")
      .text(dateString)
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

  // clean up what follows
  var a = series.map(function() {return 0;});
  
  var t = [];

  // todo: omit data points where wait is 0 and patients waiting is 0, just noise on the graph
  series.map(function(e,i){
    e.data.map(function(o){
      a[i] = a[i] + o.yRight_2;
      o.i = i;
      o.a = a[i];
      // may not need this
      o.v = true;
      if (o.yLeft_1 > 0  && o.yRight_1 > 0) {
        t.push(o);
      }
    });
  });

  function compare(a,b) {
    if (a.x < b.x)
       return -1;
    if (a.x > b.x)
      return 1;
    return 0;
  }

  var data = t.sort(compare);

  // plot the initial set of circles
  var circle = svg.selectAll("circle")
    .data(data)
    .enter().append("svg:circle")
    .attr("class", function(d,i) { return "circle" + d.i; })
    .attr("fill", function(d,i) {return sColors(d.i);})
    //.attr("stroke", function(d,i) {return sColors(d.i);})
    .attr("opacity", .4)
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
    .attr("x", bXScale)
    .attr("y", bYScale.rangeBand() / 2)
    .attr("dx", -6)
    .attr("dy", ".35em")
    .attr("fill", "white")
    .attr("text-anchor", "end")
    .text(bXScale.tickFormat(10));

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




/*

  for (var o in s) {
    plotData(s[o],b,c);
  }
}



function plotSeries(series,config) {
  var b = series.pop(), 
    data = [], 
    w = 640,
    h = 400,
    p = 30,

    // timeframe bottom and top
    //tfb = b['seriesMin']['x'],
    //tft = b['seriesMax']['x'],

    // wait time bottom and top
    //wtb = b['seriesMin']['yLeft'],
    wtt = b['seriesMax']['yLeft'],
    //wtt = 120,

    // patients waiting bottom and top
    //pwb = b['seriesMin']['yRight'],
    pwt = b['seriesMax']['yRight'],
    //pwt = 12,

    // total patients seen bottom and top

    //xl = c['xLabels']['value'].split(','),
    c = d3.scale.category10(),

    // x axis is the accumulation of total patients seen
    x = d3.scale.linear().domain([0, 100]).range([0, w]),

    // y axis is the wait time 
    y = d3.scale.linear().domain([0, wtt]).range([h, 0]),

    // r (radius) is the number of patients waiting
    r = d3.scale.linear().domain([12, (pwt*3)]).range([12, (pwt*3)]),

    // this will display the current time frame 
    title = d3.select("body")
      .append("hr")
      .append("h3")
      .text("")
      .attr("align", "center"),

    svg = d3.select("body")
      .append("svg:svg")
      .attr("width", w + p * 4)
      .attr("height", h + p * 2)
      .append("svg:g")
      .attr("transform", "translate(" + p + "," + p + ")");

  var vrules = svg.selectAll("g.vrule")
    .data(x.ticks(20))
    .enter().append("svg:g")
    .attr("class", "vrule");

  vrules.append("svg:line")
    .attr("x1", x)
    .attr("x2", x)
    .attr("y1", 0)
    .attr("y2", h - 1);

  vrules.append("svg:text")
    .attr("x", x)
    .attr("y", h + 3)
    .attr("dy", "1.71em")
    .attr("text-anchor", "start")
    .text(x.tickFormat(10));

  //horizontal lines
  var hlrules = svg.selectAll("g.hlrule")
    .data(y.ticks(20))
    .enter().append("svg:g")
    .attr("class", "hlrule");

  hlrules.append("svg:line")
    .attr("y1", y)
    .attr("y2", y)
    .attr("x1", 0)
    .attr("x2", w + 1);

  hlrules.append("svg:text")
    .attr("y", y)
    .attr("x", -3)
    .attr("dy", ".35em")
    .attr("stroke", "grey")
    .attr("text-anchor", "end")
    .text(y.tickFormat(10));

    // Legend
  for (var l = 0; l < series.length; l++) {
    svg.append("svg:rect")
      .attr("y", l * 12 + 10)
      .attr("x", 12)
      .attr("width", 10)
      .attr("height", 10)
      .attr("fill", c(l))
      .attr("stroke", "none");
    svg.append("svg:text")
      .attr("x", 24)
      .attr("y", l * 12 + 10)
      .attr("dy", ".75em")
      .attr("text-anchor", "start")
      .text(series[l]['seriesName'].replace(/"/g,''));
  }

  var a = series.map(function() {return 0;});
  
  var t = [];

  series.map(function(e,i){
    e.data.map(function(o){
      a[i] = a[i] + o.yRight_2;
      o.i = i;
      o.a = a[i];
      t.push(o);
    });
  });

  function compare(a,b) {
    if (a.x < b.x)
       return -1;
    if (a.x > b.x)
      return 1;
    return 0;
  }

  data = t.sort(compare);

  //plot the initial set of circles
  var circle = svg.selectAll("circle")
    //.data(data.map(function() {return 0;}))
    .data(data)
    .enter().append("svg:circle")
    .attr("fill", function(d,i) {return c(d.i);})
    .attr("opacity", 0)
    .attr("cx", function(d,i) {return x(d.a);})
    .attr("cy", function(d,i) {return y(d.yLeft_1);})
    .attr("r", function(d,i) {return r(9 + (d.yRight_1 * 3));});

  var i = 0, o = 1;

  function intervalFunction(){ 
    var p = [i, i + ( series.length * o)];

    circle
      .attr("opacity", function(d,s) {
        var f = .05;
        if ((s >= Array.min(p)) && (s < Array.max(p))) {
          title.text(data[s].xTime);
          f = .80;
        //} else if (((o > 0) && (s < Array.min(p))) || ((o < 0) && (s >= Array.max(p))))  {
        } else if ((s > (series.length * 6)) && (s < Array.min(p))) {
          f = .10;
        } else {
          f = 0;
        }
        return f;
      });

    i = p[1];
    // get max data length here
    if (i >= data.length) { clearInterval(v); }
    if (i <= 0) { clearInterval(v); }
  } 

  var v = setInterval(intervalFunction, 120);

  p = d3.select("body")
    .append("p")
    .append("button")
    .text("pause")
    .attr("align", "center");

  var g = true;

  function pauseResume() {
    g = g ? false : true;

    if (g) {
      v = setInterval(intervalFunction, 120);
      p.text("pause");
    } else {
      v = clearInterval(v);
      o = o * (-1);

      if (o == 1) { 
        p.text("play");
      }
      else {
        p.text("reverse");
      }

    }

  };

  p.on("click", pauseResume);
*/

/*
  var a = data.map(function() {return 0;}),
    i = 0, o = 1;
*/

}
