Array.max = function( array ){
    return Math.max.apply( Math, array );
};

Array.min = function( array ){
    return Math.min.apply( Math, array );
};

function plotSeries(series,config) {
  var b = series.pop(), 
    data = [], 
    w = 800,
    h = 300,
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
      .transition()
      .duration(180)
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

  var v = setInterval(intervalFunction, 180);

  p = d3.select("body")
    .append("p")
    .append("button")
    .text("pause")
    .attr("align", "center");

  var g = true;

  function pauseResume() {
    g = g ? false : true;

    if (g) {
      v = setInterval(intervalFunction, 180);
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

/*
  var a = data.map(function() {return 0;}),
    i = 0, o = 1;
*/

}
