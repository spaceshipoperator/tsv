/*
 * 
 * 
 * 
 * 
 * 
 * 
 * 
 */

var xlabs = ["foo","bar","baz","boo","fuz","fiz","biz","buz","yed","daa","yad"];

var data = d3.range(50).map(function(i) {
//  return {x: i / 49, y: (Math.sin(i / 3) + 1) / 2};
  return {x: i / 49, y: (Math.sin(i / 3) + 1) * 3};
});

var w = 600,
    h = 275,
    p = 20,
    x = d3.scale.linear().domain([0, 1]).range([0, w]),
    y = d3.scale.linear().domain([0, 6]).range([h, 0]);

var vis = d3.select("body")
    .data([data])
  .append("svg:svg")
    .attr("width", w + p * 2)
    .attr("height", h + p * 2)
  .append("svg:g")
    .attr("transform", "translate(" + p + "," + p + ")");

var rules = vis.selectAll("g.rule")
    .data(x.ticks(20))
  .enter().append("svg:g")
    .attr("class", "rule");

rules.append("svg:line")
    .attr("x1", x)
    .attr("x2", x)
    .attr("y1", 0)
    .attr("y2", h - 1);

rules.append("svg:line")
    .attr("class", function(d) { return d ? null : "axis"; })
    .attr("y1", y)
    .attr("y2", y)
    .attr("x1", 0)
    .attr("x2", w + 1);

rules.append("svg:text")
    .attr("x", x)
    .attr("y", h + 3)
    .attr("dy", "12")
    //.attr("dy", ".71em")
    .attr("text-anchor", "middle")
    .text(function(d,i) { return xlabs[i]; });
//    .text(x.tickFormat(10));

rules.append("svg:text")
    .attr("y", y)
    .attr("x", -3)
    .attr("dy", ".35em")
    .attr("text-anchor", "end")
    .text(y.tickFormat(10));

vis.append("svg:path")
//    .attr("class", "line")
    .attr("fill","none")
    .attr("stroke","magenta")
    .attr("stroke-width","1.5px")
    .attr("d", d3.svg.line()
    .x(function(d) { return x(d.x); })
    .y(function(d) { return y(d.y); }));

vis.append("svg:path")
//    .attr("class", "line")
    .attr("fill","none")
    .attr("stroke","blue")
    .attr("stroke-width","1.5px")
    .attr("d", d3.svg.line()
    .x(function(d) { return x(d.x + 0.05); })
    .y(function(d) { return y(d.y); }));

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
