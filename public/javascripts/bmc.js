function plotSeries(series,config) {
  var b = series.pop(), 
    data = series,
    w = 800,
    h = 275,
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
  for (var l = 0; l < data.length; l++) {
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
      .text(data[l]['seriesName'].replace(/"/g,''));
  }

  //plot the initial set of circles
  var circle = svg.selectAll("circle")
    //.data(data.map(function() {return 0;}))
    .data(data)
    .enter().append("svg:circle")
    .attr("fill", function(d,i) {return c(i);})
    .attr("opacity", .75)
    .attr("cx", x(0))
    .attr("cy", y(-20))
    .attr("r", 12);

  var a = data.map(function() {return 0;}),
    i = 0, o = 1;

  function intervalFunction(){ 
    circle
      .transition()
      .duration(180)
      .attr("cx", function(d,s) { 
        if (data[s]['data'][i]) {
          if (o < 0) {
            a[s] = a[s] - data[s]['data'][i]['yRight_2'];
          } else {
            a[s] = a[s] + data[s]['data'][i]['yRight_2'];
          }
          return x(a[s]);
        } else {
          return this.cx.baseVal.value;
        }
      } )
      .attr("cy", function(d,s) { 
        if (data[s]['data'][i]) {
          return y(data[s]['data'][i]['yLeft_1']);
        } else {
          return this.cy.baseVal.value;
        }
      } )
      .attr("r", function(d,s) { 
        if (data[s]['data'][i]) {
          title.text(data[s]['data'][i]['xTime']);
          return r(12 + (data[s]['data'][i]['yRight_1'] * 3));
        } else {
          return this.r.baseVal.value;
        }
      } );

    i = i + (1*o);
    // get max data length here
    if (i > 90) { clearInterval(t); }
    if (i == 0) { clearInterval(t); }
  } 

  var t = setInterval(intervalFunction, 90);

  p = d3.select("body")
    .append("button")
    .text("pause")
    .attr("align", "center");

  var g = true;

  function pauseResume() {
    g = g ? false : true;

    if (g) {
      t = setInterval(intervalFunction, 90);
      p.text("pause");
    } else {
      t = clearInterval(t);
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

}
