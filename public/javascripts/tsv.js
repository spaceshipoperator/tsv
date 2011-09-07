function plotSeries(s) {
  var b = s.pop();

  for (var o in s) {
    plotData(s[o],b);
  }
}

//data,xMax,xMin,yLeftMax,yLeftMin
function plotData(o,b) {

  var xlabs = [];
  
  xlabs[0] = '7/18';
  xlabs[4] = '7/19';
  xlabs[9] = '7/20';
  xlabs[14] = '7/21';
  xlabs[19] = '7/22';

  var w = 600,
    h = 275,
    p = 30,
    t = o['seriesName'],
    xb = b['seriesMin']['x'],
    xt = b['seriesMax']['x'],
    yb = b['seriesMin']['yLeft'],
    yt = b['seriesMax']['yLeft'],
    x = d3.scale.linear().domain([xb, xt]).range([0, w]),
    y = d3.scale.linear().domain([yb, yt]).range([h, 0]),
    data = o.data;

  d3.select("body")
    .append("hr")
    .append("h3")
    .text(t)
    .attr("align", "center");

  var vis = d3.select("body")
    .data([data])
    .append("svg:svg")
    .attr("width", w + p * 2)
    .attr("height", h + p * 2)
    .append("svg:g")
    .attr("transform", "translate(" + p + "," + p + ")");
    
  vis.append("svg:path")
    .attr("fill","none")
    .attr("stroke","magenta")
    .attr("stroke-width","1.5px")
    .attr("d", d3.svg.line()
    .x(function(d) { return x(d.x); })
    .y(function(d) { return y(d.yLeft_1); }));

  vis.append("svg:path")
    .attr("fill","none")
    .attr("stroke","blue")
    .attr("stroke-width","1.5px")
    .attr("d", d3.svg.line()
    .x(function(d) { return x(d.x); })
    .y(function(d) { return y(d.yLeft_2); }));

  //vertical rules
  var vrules = vis.selectAll("g.vrule")
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
    .attr("dy", ".71em")
    .attr("text-anchor", "middle")
    .text(function(d,i) { return xlabs[i] ? xlabs[i] : ""; });

  //horizontal lines
  var hrules = vis.selectAll("g.hrule")
    .data(y.ticks(20))
    .enter().append("svg:g")
    .attr("class", "hrule");

  hrules.append("svg:line")
    //.attr("class", function(d) { return d ? null : "axis"; })
    .attr("y1", y)
    .attr("y2", y)
    .attr("x1", 0)
    .attr("x2", w + 1);

  hrules.append("svg:text")
    .attr("y", y)
    .attr("x", -3)
    .attr("dy", ".35em")
    .attr("text-anchor", "end")
    .text(y.tickFormat(10));

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
