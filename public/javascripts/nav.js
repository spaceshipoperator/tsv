Array.max = function( array ){
    return Math.max.apply( Math, array );
};

Array.min = function( array ){
    return Math.min.apply( Math, array );
};

var od = 1000*60*60*24; 

var dateToStr = function (d) {
  var y = d.getFullYear().toString(),
    m = '0' + (d.getMonth() +1).toString(),
    s = '0' + d.getDate().toString();
    return y + '-' + m.substring(m.length - 2) + '-' + s.substring(s.length - 2);
};

function showCharts(s,c,b) {
var dateParts = c.asOfDate.value.split('-').map(Number),
  selectedDate = new Date(dateParts[0], dateParts[1] - 1, dateParts[2]);

  d3.select(window).on("keydown", function() {
    //alert(d3.event.keyCode);
    switch (d3.event.keyCode) {
      // left 
      case 37: selectedDate = new Date(selectedDate.getTime() - od) ; break;
      // right 
      case 39: selectedDate = new Date(selectedDate.getTime() + od) ; break;
      // up
      case 38: selectedDate = new Date(selectedDate.getTime() - (7*od)) ; break;
      // down
      case 40: selectedDate = new Date(selectedDate.getTime() + (7*od)) ; break;
    }
    // this is a little bit of nastiness
    c.asOfDate.value = dateToStr(selectedDate);
    showRunChart(s,c,b);
    showScatterplot(s,c,b);
  });
  showRunChart(s,c,b);
  showScatterplot(s,c,b);
}






//  d3.select(window).on("keydown", function() {
    //alert(d3.event.keyCode);
//    switch (d3.event.keyCode) {
      // left 
//      case 37: selectedDate = new Date(selectedDate.getTime() - od) ; break;
      // right 
//      case 39: selectedDate = new Date(selectedDate.getTime() + od) ; break;
      // up
//      case 38: selectedDate = new Date(selectedDate.getTime() - (7*od)) ; break;
      // down
//      case 40: selectedDate = new Date(selectedDate.getTime() + (7*od)) ; break;
//    }
