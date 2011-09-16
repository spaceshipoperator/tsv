function plotSeries(s,c) {
  var b = s.pop();

  for (var o in s) {
    plotData(s[o],b,c);
  }
}

function plotData(o,b,c) {
  var w = 800,
    h = 275,
    p = 30,
    t = o['seriesName'],
    xb = b['seriesMin']['x'],
    xt = b['seriesMax']['x'],

    ylb = b['seriesMin']['yLeft'],
    ylt = b['seriesMax']['yLeft'],

    yrb = b['seriesMin']['yRight'],
    yrt = b['seriesMax']['yRight'],

    xl = c['xLabels']['value'].split(','),

    xs = d3.scale.linear().domain([xb, xt]).range([0, w]),
    yls = d3.scale.linear().domain([ylb, ylt]).range([h, 0]),
    yrs = d3.scale.linear().domain([yrb, yrt]).range([h, 0]),

    xls = d3.scale.ordinal().domain(xl).rangePoints([0, w]),

    data = o.data;

  d3.select("body")
    .append("hr")
    .append("h3")
    .text(t)
    .attr("align", "center");

  var vis = d3.select("body")
    .data([data])
    .append("svg:svg")
    .attr("width", w + p * 4)
    .attr("height", h + p * 2)
    .append("svg:g")
    .attr("transform", "translate(" + p + "," + p + ")");
    
  vis.append("svg:path")
    .attr("fill","none")
    .attr("stroke","red")
    .attr("stroke-width","1.5px")
    .attr("d", d3.svg.line()
    .x(function(d) { return xs(d.x); })
    .y(function(d) { return yls(d.yLeft_1); }));

//  vis.append("svg:path")
//    .attr("fill","none")
//    .attr("stroke","blue")
//    .attr("stroke-width","1.5px")
//    .attr("d", d3.svg.line()
//    .x(function(d) { return xs(d.x); })
//    .y(function(d) { return yls(d.yLeft_2); }));

  vis.selectAll("circle.line")
    .data(data)
    .enter().append("svg:circle")
    .attr("stroke","steelblue")
    .attr("class", "line")
    .attr("cx", function(d) { return xs(d.x); })
    .attr("cy", function(d) { return yrs(d.yRight_1); })
    .attr("r", 1.5);

//  vis.append("svg:path")
//    .attr("fill","none")
//    .attr("stroke","green")
//    .attr("stroke-width","1.5px")
//    .attr("d", d3.svg.line()
//    .x(function(d) { return xs(d.x); })
//    .y(function(d) { return yrs(d.yRight_1); }));

//  vis.append("svg:path")
//    .attr("fill","none")
//    .attr("stroke","orange")
//    .attr("stroke-width","1.5px")
//    .attr("d", d3.svg.line()
//    .x(function(d) { return xs(d.x); })
//    .y(function(d) { return yrs(d.yRight_3); }));

  //vertical rules
  var vrules = vis.selectAll("g.vrule")
    .data(xl)
    .enter().append("svg:g")
    .attr("class", "vrule");

  vrules.append("svg:line")
    .attr("x1", xls)
    .attr("x2", xls)
    .attr("y1", 0)
    .attr("y2", h - 1);

  vrules.append("svg:text")
    .attr("x", xls)
    .attr("y", h + 3)
    .attr("dy", ".71em")
    .attr("text-anchor", "start")
    .text(function(d,i) { return d;});

  //horizontal lines
  var hlrules = vis.selectAll("g.hlrule")
    .data(yls.ticks(20))
    .enter().append("svg:g")
    .attr("class", "hlrule");

  hlrules.append("svg:line")
    //.attr("class", function(d) { return d ? null : "axis"; })
    .attr("y1", yls)
    .attr("y2", yls)
    .attr("x1", 0)
    .attr("x2", w + 1);

  hlrules.append("svg:text")
    .attr("y", yls)
    .attr("x", -3)
    .attr("dy", ".35em")
    .attr("stroke", "red")
    .attr("text-anchor", "end")
    .text(yls.tickFormat(10));

  var hrrules = vis.selectAll("g.hrrule")
    .data(yrs.ticks(20))
    .enter().append("svg:g")
    .attr("class", "hrule");

  hrrules.append("svg:line")
    //.attr("class", function(d) { return d ? null : "axis"; })
    .attr("y1", yrs)
    .attr("y2", yrs)
    .attr("x1", 0)
    .attr("x2", w + 1);

  hrrules.append("svg:text")
    .attr("y", yrs)
    .attr("x", w + 9)
    .attr("dy", ".35em")
    .attr("stroke", "steelblue")
    .attr("text-anchor", "start")
    .text(yrs.tickFormat(10));
  d3.select("body").append("p").append("p");

};


//.line {
//  fill: none;
//  stroke: steelblue;
//  stroke-width: 1.5px;

//vis.selectAll("circle.line")
//    .data(data)
//  .enter().append("svg:circle")
//    .attr("class", "line")
//    .attr("cx", function(d) { return x(d.x); })
//    .attr("cy", function(d) { return y(d.y); })
//    .attr("r", 3.5);
