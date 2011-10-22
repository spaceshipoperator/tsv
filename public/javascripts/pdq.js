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

  // set the category
  var primaryCategories = [];
  var secondaryCategories = [];

  function setCategories(pc, sc) {
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
    json = { "id": "c_x_x", "name": "container", "children": [] };
    for (i = 0; i < primaryCategories.length; i++) {
      var rec = { "id": "c_" + i + '_x', "name": primaryCategories[i], "children": [] };
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
            var rec = { "id": "c_" + i + '_' + k, "name": scat };
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

  // set the id of each div to the primaryCategories index _ secondaryCategories index
  // on click, display the primary and secondary category names below the chart

  function fillTree(j) {
    div.data([j]).selectAll("div")
      .data(treemap.nodes)
      .enter().append("div")
      .attr("id", function(d) { return d.id; })
      .attr("class", "cell")
      .style("background", function(d) { return d.children ? color(d.name) : null; })
      .call(cell)
      .text(function(d) { return d.children ? null : d.name; })
      .on("mouseover", function() { 
        this.style.borderWidth="3px";
        this.style.borderColor="black"; })
      .on("mouseout", function() { 
        this.style.borderWidth="";
        this.style.borderColor=""; })
      .on("click", function(d) { displayCats(this.id, d.name); });

  }

  fillTree(json);

  function cell() {
    this
      .style("left", function(d) { return d.x + "px"; })
      .style("top", function(d) { return d.y + "px"; })
      .style("width", function(d) { return d.dx - 1 + "px"; })
      .style("height", function(d) { return d.dy - 1 + "px"; });
  }

  
  function displayCats(i,n) {
    var pri = primaryCategories[i.split('_')[1]];
    
    d3.select('#pri')
      .text(pri)
      .style("background", function() { return color(pri); } );

    d3.select("#sec")
      .text(n)
      .style("background", "#D8D8D8");
  }

  function clearCats() {
    d3.select("#sec")
      .text("")
      .style("background", "none");

    d3.select("#pri")
      .text("")
      .style("background", "none");
  }

  function setBG(c,i) {
    d3.selectAll(c)
      .style("background", "none");
    d3.select('#' + i)
      .style("background", "#F3F781");
  }

  // clear the background of all and set the background of the selected
  d3.selectAll(".size").on("click", function() {
    setBG(".size", this.id);
    selectedSize = columnNames.indexOf(this.id);
    div.selectAll("div")
      .data(treemap.value(function(d) { return d[columnNames[selectedSize]]; }))
      .transition()
      .duration(1500)
      .call(cell);
  });

  d3.selectAll(".filter").on("click", function() {
    clearCats();
    setBG(".filter", this.id);
    selectedFilter = columnNames.indexOf(this.id);
    treemap.sticky(false);
    div.selectAll("div").remove();
    treemap.sticky(true);
    filterJSON(selectedFilter);
    fillTree(json);
  });

  d3.selectAll(".category").on("click", function() {
    clearCats();
    setBG(".category", this.id);
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
