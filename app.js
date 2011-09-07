/**
 * Module dependencies.
 */

var express = require('express'),
  fs = require('fs'), 
  lazy = require('lazy'),
  spawn = require('child_process').spawn,
  app = module.exports = express.createServer();

// Configuration

app.configure(function(){
  app.set('views', __dirname + '/views');
  app.set('view engine', 'jade');
  app.use(express.bodyParser());
  app.use(express.methodOverride());
  app.use(app.router);
  app.use(express.static(__dirname + '/public'));
});

app.configure('development', function(){
  app.use(express.errorHandler({ dumpExceptions: true, showStack: true })); 
});

app.configure('production', function(){
  app.use(express.errorHandler()); 
});

// helper functions
Array.max = function( array ){
    return Math.max.apply( Math, array );
};

Array.min = function( array ){
    return Math.min.apply( Math, array );
};

var isConfig = function(x) {
  var re = /.*\.config/;
  return String(x).match(re);
};

function getSeriesData (name, next) {
  //read the config to get the "query" and other stuff

  var csv = spawn('cat', ["./tsv\/" + name + ".csv"]);

  new lazy(csv.stdout)
    .lines
    .map(String)
    .map(function (line){
      return line.split(',');
    })
    .join(function (results) {
      next(results);
    });
};

function buildSeries (name, next) {
  getSeriesData(name, function(data) {
    var header = data[0],
      t = [], // temporary array will have named indexes 
      results = []; // will be sent to next, must be JSON stringifiable

    for(var i = 1; i < data.length ; i++) {
      var c = data[i];
      var k = c[0];
      var r = "";
      // using an array with named index for convenience 
      // in order to collect all data points for a given key 
      t[k] = t[k] || {}; 
      t[k][header[0]] = c[0];
      t[k][header[1]] = c[1];
      t[k]['data'] = t[k]['data'] || [];
      for (var j = 2; j < c.length ; j++) {
        r = r + " \"" + header[j] + "\":" + c[j] + ",";
      } 
      t[k]['data'].push(JSON.parse("{" + r.substring(0,r.length-1) + " }"));

    }

    // get the x and y bounds for each individual series
    for (var o in t) {
      var dataMax = {},
        dataMin = {};
  
      for (var p = 2; p < header.length; p++) {
        var k = header[p],
          maxp, minp;
        
        maxp = Array.max(
          t[o]['data'].map(function(e){
            return(e[k]);
          }));
        dataMax[k] = maxp;
  
        minp = Array.min(
          t[o]['data'].map(function(e){
            return(e[k]);
          }));
        dataMin[k] = minp;
      }

      t[o]['dataMax'] = dataMax;
      t[o]['dataMin'] = dataMin;
    }

    //// function prepareSeries
    // getDateLabels
    // finally get the x and y bounds over all series
    var seriesMax = {},
      seriesMin = {},
      xt = [],
      xb = [],
      ylt = [],
      ylb = [],
      yrt = [],
      yrb = [],
      sb = {};
  
    for (d in t) {
      xt.push(t[d]['dataMax']['x']);
      xb.push(t[d]['dataMin']['x']);
  
      // this limits to 4 options on left or right y axis
      // could be a little more dynamo here
      for (var e = 1; e < 4; e++) {
        ylt.push(t[d]['dataMax']['yLeft_' + e]);
        yrt.push(t[d]['dataMax']['yRight_' + e]);
  
        ylb.push(t[d]['dataMin']['yLeft_' + e]);
        yrb.push(t[d]['dataMin']['yRight_' + e]);
      }
    }

    // filter Number happens before push 0
    // as, apparently, 0 is not a number
    ylt = ylt.filter(Number);
    ylb = ylb.filter(Number);

    yrt = yrt.filter(Number);
    yrb = yrb.filter(Number);

    // config should drive fixed bounds, if any
    ylt.push(0);
    ylb.push(0);

    yrt.push(0);
    yrb.push(0);
  
    seriesMax['x'] = Array.max(xt);
    seriesMin['x'] = Array.min(xb);
  
    seriesMax['yLeft'] = Array.max(ylt);
    seriesMin['yLeft'] = Array.min(ylb);
  
    seriesMax['yRight'] = Array.max(yrt);
    seriesMin['yRight'] = Array.min(yrb);

    sb['seriesMax'] = seriesMax;
    sb['seriesMin'] = seriesMin;

    t.push(sb);

    // getting rid of named indexes because JSON cannot stringify them
    for (var f in t) {
        results.push(t[f]);
    }

    next(results);
  });
};

// Routes
app.get('/', function(req, res){
  var configs, wtf;
  // http://howtonode.org/do-it-fast
  fs.readdir("./tsv", function(err, files) {
    if (err) throw err;
    // http://www.hunlock.com/blogs/Mastering_Javascript_Arrays#quickIDX13
    configs = files.filter(isConfig).map(function(e){
      return e.split(".")[0];
    });

    res.render('index', {
      title: 'tsv',
      configs: configs
    });
  });
});

app.get('/vis/:vname', function(req, res){
  var vname = req.params.vname, 
    dname = vname.split('_').join(' ');


  // http://howtonode.org/control-flow
  buildSeries(vname, function(series) {

    res.render('vis', {
      title: dname,
      series: series
    });
  });
});

app.listen(3000);
console.log("Express server listening on port %d in %s mode", app.address().port, app.settings.env);