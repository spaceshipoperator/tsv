function showTreemap(o,c,h) {
  var i = 0, // for loops
    j = 0, // nested for loops
    k = 0, // omg more nested loops
    l = 0, // for crying out loud already
    columnNames = h, 
    primaryCategory = columnNames.indexOf('category_1'),
    secondaryCategory = columnNames.indexOf('category_2'),
    selectedFilter = columnNames.indexOf('filter_1'),
    selectedSize = columnNames.indexOf('size_1'),
    sizes = columnNames.filter(function(e){ return /^size_/.test(e); });

  var w = 900,
      h = 450,
      color = d3.scale.category20c();

  // set the category
  var primaryCategories = [];
  for (i = 0; i < o.length; i++) {
    var x = o[i][primaryCategory].replace(/"/g, '') ;
    if (primaryCategories.indexOf(x) == -1) {
      primaryCategories.push(x);
    }
  }

  var secondaryCategories = [];
  for (i = 0; i < o.length; i++) {
    var x = o[i][secondaryCategory].replace(/"/g, '') ;
    if (secondaryCategories.indexOf(x) == -1) {
      secondaryCategories.push(x);
    }
  }

  // filter the data
  var json = {"name": "container", "children": []};
  for (i = 0; i < primaryCategories.length; i++) {
    var rec = {"name": primaryCategories[i], "children": []};
    json["children"].push(rec);
  };

  for (i = 0; i < json["children"].length; i++) {
    var pcat = json["children"][i]["name"];
    for (j = 0; j < secondaryCategories.length; j++) {
      var scat = secondaryCategories[j];
      for (k = 0; k < o.length; k++) {
        if ((o[k][selectedFilter] == '1') &&
            (o[k][primaryCategory].replace(/"/g, '') == pcat) &&
            (o[k][secondaryCategory].replace(/"/g, '') == scat)) {
          var rec = { "name": scat };
          for (l = 0; l < sizes.length; l++) {
            rec[sizes[l]] = parseInt(o[k][columnNames.indexOf(sizes[l])]);
          }
          json["children"][i]["children"].push(rec);
        }
      }
    }
  };

  var treemap = d3.layout.treemap()
      .size([w, h])
      .sticky(true)
      .value(function(d) { return d[columnNames[selectedSize]]; });

  var div = d3.select("#chart").append("div")
      .style("position", "relative")
      .style("width", w + "px")
      .style("height", h + "px");

//  d3.json(jsono, function(json) {
    div.data([json]).selectAll("div")
        .data(treemap.nodes)
      .enter().append("div")
        .attr("class", "cell")
        .style("background", function(d) { return d.children ? color(d.name) : null; })
        .call(cell)
        .text(function(d) { return d.children ? null : d.name; })
        .on("mouseover", function() { 
          this.style.borderWidth="3px";
          this.style.borderColor="black"; })
        .on("mouseout", function() { 
          this.style.borderWidth="";
          this.style.borderColor=""; });

    d3.select("#size_1").on("click", function() {
      div.selectAll("div")
          .data(treemap.value(function(d) { return d[columnNames[selectedSize]]; }))
        .transition()
          .duration(1500)
          .call(cell);
    });

//      d3.select("#size_1").classed("active", true);
//      d3.select("#size_4").classed("active", false);

    d3.select("#size_4").on("click", function() {
      div.selectAll("div")
          .data(treemap.value(function(d) { return d["size_4"]; }))
        .transition()
          .duration(1500)
          .call(cell);
  
//      d3.select("#size_1").classed("active", false);
//      d3.select("#size_4").classed("active", true);
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

  // lets just hack it together so we can see some data real quick
  // promise I'll come back around real soon to clean things up

  //var departments = [];
  //for (var i = 0; i < o.length; i++) {
  //  if (departments.indexOf(o[i][0]) == -1) {
  //    departments.push(o[i][0]);
  //  }
  //}
 
//  var diagnoses = [];
//  for (i = 0; i < o.length; i++) {
//    var d = o[i][1].replace(/"/g, '') ;
//    if ((o[i][2] > 100) && (diagnoses.indexOf(d) == -1)) {
//      diagnoses.push(d);
//    }
//  }

