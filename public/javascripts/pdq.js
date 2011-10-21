var color = d3.scale.category20c();
function showTreemap(o,c,columnNames) {
  var i = 0, // for loops
    j = 0, // nested for loops
    k = 0, // omg more nested loops
    l = 0, // for crying out loud already
    primaryCategory = columnNames.indexOf('category_1'),
    secondaryCategory = columnNames.indexOf('category_2'),
    selectedFilter = columnNames.indexOf('filter_1'),
    selectedSize = columnNames.indexOf('size_1'),
    sizes = columnNames.filter(function(e){ return /^size_/.test(e); });

  var w = 900,
      h = 450;

  var treemap = d3.layout.treemap()
      .size([w, h])
      .sticky(true)
      .value(function(d) { return d[columnNames[selectedSize]]; });

  var div = d3.select("#chart").append("div")
      .style("position", "relative")
      .style("width", w + "px")
      .style("height", h + "px");

  var primaryCategories = [];
  var secondaryCategories = [];
  function setCategories(pc, sc) {
    // set the category
    for (i = 0; i < o.length; i++) {
      var x = o[i][pc].replace(/"/g, '') ;
      if (primaryCategories.indexOf(x) == -1) {
        primaryCategories.push(x);
      }
    }
    
    for (i = 0; i < o.length; i++) {
      var x = o[i][sc].replace(/"/g, '') ;
      if (secondaryCategories.indexOf(x) == -1) {
        secondaryCategories.push(x);
      }
    }
  }

  setCategories(primaryCategory, secondaryCategory);
    
    // filter the data
  var json = {};

  function filterJSON(sf){
    json = {"name": "container", "children": []};
    for (i = 0; i < primaryCategories.length; i++) {
      var rec = {"name": primaryCategories[i], "children": []};
      json["children"].push(rec);
    };
    
    for (i = 0; i < json["children"].length; i++) {
      var pcat = json["children"][i]["name"];
      for (j = 0; j < secondaryCategories.length; j++) {
        var scat = secondaryCategories[j];
        for (k = 0; k < o.length; k++) {
          if ((o[k][sf] == '1') &&
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
  };
    
  filterJSON(selectedFilter); 

  function fillTree(j) {
    div.data([j]).selectAll("div")
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
  }

  fillTree(json);

  function cell() {
    this
      .style("left", function(d) { return d.x + "px"; })
      .style("top", function(d) { return d.y + "px"; })
      .style("width", function(d) { return d.dx - 1 + "px"; })
      .style("height", function(d) { return d.dy - 1 + "px"; });
  }

  d3.selectAll(".size").on("click", function() {
    selectedSize = columnNames.indexOf(this.id);
    div.selectAll("div")
      .data(treemap.value(function(d) { return d[columnNames[selectedSize]]; }))
      .transition()
      .duration(1500)
      .call(cell);
  });

  d3.selectAll(".filter").on("click", function() {
    selectedFilter = columnNames.indexOf(this.id);
    treemap.sticky(false);
    div.selectAll("div").remove();
    treemap.sticky(true);
    filterJSON(selectedFilter);
    fillTree(json);
  });

  d3.selectAll(".category").on("click", function() {
    if (!(columnNames.indexOf(this.id) == primaryCategory)) {
      secondaryCategory = primaryCategory;
      primaryCategory = columnNames.indexOf(this.id);
      treemap.sticky(false);
      div.selectAll("div").remove();
      treemap.sticky(true);
      setCategories(primaryCategory, secondaryCategory);
      filterJSON(selectedFilter);
      fillTree(json);
    }
  });
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

