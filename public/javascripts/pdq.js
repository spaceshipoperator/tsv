function showTreemap(o,c) {
  // lets just hack it together so we can see some data real quick
  // promise I'll come back around real soon to clean things up

  //var departments = [];
  //for (var i = 0; i < o.length; i++) {
  //  if (departments.indexOf(o[i][0]) == -1) {
  //    departments.push(o[i][0]);
  //  }
  //}
 
  var i = 0, // for loops
    j = 0; // nested for loops

  var diagnoses = [];
  for (i = 0; i < o.length; i++) {
    var d = o[i][1].replace(/"/g, '') ;
    if ((o[i][2] > 100) && (diagnoses.indexOf(d) == -1)) {
      diagnoses.push(d);
    }
  }

  var jsono = {"name": "diagnoses", "children": []};
  for (i = 0; i < diagnoses.length; i++) {
    var rec = {"name": diagnoses[i], "children": []};
    for (j = 0; j < o.length; j++) {
      if (o[j][1].replace(/"/g, '') == diagnoses[i]) {
        rec.children.push({"name": o[j][0].replace(/"/g, '').replace("UCC",''), "patientCount": parseInt(o[j][2]), "averageVisitDuration": parseInt(o[j][5]) });
      }
    }
    jsono["children"].push(rec);
  }

  var w = 900,
      h = 450,
      color = d3.scale.category20c();

  var treemap = d3.layout.treemap()
      .size([w, h])
      .sticky(true)
      .value(function(d) { return d.patientCount; });

  var div = d3.select("#chart").append("div")
      .style("position", "relative")
      .style("width", w + "px")
      .style("height", h + "px");

//  d3.json(jsono, function(json) {
    div.data([jsono]).selectAll("div")
        .data(treemap.nodes)
      .enter().append("div")
        .attr("class", "cell")
        .style("background", function(d) { return d.children ? color(d.name) : null; })
        .call(cell)
        .text(function(d) { return d.children ? null : d.name; });

    d3.select("#size").on("click", function() {
      div.selectAll("div")
          .data(treemap.value(function(d) { return d.patientCount; }))
        .transition()
          .duration(1500)
          .call(cell);

      d3.select("#size").classed("active", true);
      d3.select("#count").classed("active", false);
    });

    d3.select("#count").on("click", function() {
      div.selectAll("div")
          .data(treemap.value(function(d) { return d.averageVisitDuration; }))
        .transition()
          .duration(1500)
          .call(cell);
  
      d3.select("#size").classed("active", false);
      d3.select("#count").classed("active", true);
    });
//  });

  function cell() {
    this
      .style("left", function(d) { return d.x + "px"; })
      .style("top", function(d) { return d.y + "px"; })
      .style("width", function(d) { return d.dx - 1 + "px"; })
      .style("height", function(d) { return d.dy - 1 + "px"; });
  }

}
