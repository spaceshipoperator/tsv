/*
var od = 1000*60*60*24; 

var dateToStr = function (d) {
  var y = d.getFullYear().toString(),
    m = '0' + (d.getMonth() +1).toString(),
    s = '0' + d.getDate().toString();
    return y + '-' + m.substring(m.length - 2) + '-' + s.substring(s.length - 2);
};
*/

function showRunChart(s,c,b) {
  var a = c.asOfDate.value.split('-').map(Number),
    selectedDate = new Date(a[0], a[1] - 1, a[2]);

  function clearPlot() {
    d3.selectAll("circle").remove();  
    d3.selectAll("svg").remove();  
    d3.selectAll(".vtitle").remove();  
    d3.selectAll("hr").remove();  
    d3.selectAll("h3").remove();  
    d3.select("#runchart").remove();  

    d3.select("#ctitle")
      .append("h3")
      .attr("align", "center")
      .text(selectedDate.toDateString())
      .on("click", toggleChart);

    d3.select("body")
      .append("div")
      .attr("id", "runchart")
      .attr("style", "display: none");
  }

  function plotData(o,b,c) {
    var w = 800,
      h = 175,
      p = 30,
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
  
      t = o['seriesName'].replace(/"/g,''),
      sa = 0,
  
      data = o.data.filter(function(e) { return (e.xTime.split(' ')[0] == dateToStr(selectedDate)); });
  
    var title = d3.select("#runchart")
      .attr("class", "vtitle")
      .append("hr")
      .append("h3")
      .text("")
      .attr("align", "center");
  
    var vis = d3.select("#runchart")
      .attr("class", "vis")
      .data([data])
      .append("svg:svg")
      .attr("width", w + p * 4)
      .attr("height", h + p * 2)
      .append("svg:g")
      .attr("transform", "translate(" + p + "," + p + ")");
      
    vis.append("svg:path")
      .attr("fill","none")
      .attr("stroke","red")
      .attr("stroke-width","2px")
      .attr("d", d3.svg.line()
      .x(function(d) { return xs(d.x); })
      .y(function(d) { return yls(d.yLeft_1); }));
  
    vis.append("svg:path")
      .attr("fill","none")
      .attr("stroke","blue")
      .attr("stroke-width","2px")
      .attr("d", d3.svg.line()
      .x(function(d) { return xs(d.x); })
      .y(function(d) { return yls(d.yLeft_2); }));
  
    vis.selectAll("circle.line")
      .data(data)
      .enter().append("svg:circle")
      .attr("stroke","gray")
      .attr("fill","none")
      .attr("cx", function(d) { return xs(d.x); })
      .attr("cy", function(d) { sa = sa + d.yRight_2; return yrs(d.yRight_1); })
      .attr("r", 1.5);
  
    title.text(t + "  -  " + sa + " patients seen");

  //vertical rules
    var vrules = vis.selectAll("g.vrule")
      .data(xl)
      .enter().append("svg:g")
      .attr("class", "rule");
  
    vrules.append("svg:line")
      .attr("x1", xls)
      .attr("x2", xls)
      .attr("y1", 0)
      .attr("y2", h - 1);
  
    vrules.append("svg:text")
      .attr("x", xls)
      .attr("y", h + 3)
      .attr("dy", "1.71em")
      .attr("text-anchor", "start")
      .text(function(d,i) { return d;});
  
    //horizontal lines
    var hlrules = vis.selectAll("g.hlrule")
      .data(yls.ticks(10))
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
      .attr("stroke", "purple")
      .attr("text-anchor", "end")
      .text(yls.tickFormat(10));
  
    var hrrules = vis.selectAll("g.hrrule")
      .data(yrs.ticks(5))
      .enter().append("svg:g")
      .attr("class", "hrrule");
  
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
      .attr("stroke", "gray")
      .attr("text-anchor", "start")
      .text(yrs.tickFormat(10));
    
    d3.select("#runchart").append("p").append("p");
    
  };

  clearPlot();
  for (var o in s) {
    plotData(s[o],b,c);
  }

}
