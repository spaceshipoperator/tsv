/**
 * Module dependencies.
 */

var express = require('express'),
  fs = require('fs'), 
  lazy = require('lazy'),
  spawn = require('child_process').spawn,
  app = module.exports = express.createServer(),
  // one day in milliseconds...used within a few helper functions
  od = 1000*60*60*24; 

// express configuration
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

var checkRange = function(x, n, m) {
    if (x >= n && x <= m) { return x; }
    else { return !x; }
};

var isConfig = function(x) {
  var re = /.*\.json/;
  return String(x).match(re);
};

var dateToStr = function (d) {
  var y = d.getFullYear().toString(),
    m = '0' + (d.getMonth() +1).toString(),
    s = '0' + d.getDate().toString();
    return y + '-' + m.substring(m.length - 2) + '-' + s.substring(s.length - 2);
};

var daysAfter = function(d,n) {
  var b = new Date(d);
  var e = new Date(b.getTime() + (n*od));
  return dateToStr(e);
};

var todayStr = function() {
  var t = new Date();

  return dateToStr(t);
};

var yesterdayStr = function() {
  var t = new Date(),
    y = new Date(t - od);

  return dateToStr(y);
};

/* 
var startOfWeek = function(d) {
  var t = d || new Date();  
  var td = new Date(t.getFullYear(), t.getMonth(), t.getDate());
  return new Date(td.getTime() - (td.getDay() * od));
};

var startOfPreviousWeek = function(d) {
  return new Date(startOfWeek(d).getTime() - (7 * od));
};

var endOfWeek = function(d) {
  return new Date(startOfWeek(d).getTime() + (7 * od));
};

var endOfPreviousWeek = function(d) {
  return new Date(startOfPreviousWeek(d).getTime() + (7 * od));
};
*/

function getSeriesConfig(vname, selectedOptions, next) {
  var results = [];

  fs.readFile("./tsv/" + vname + ".json", function(err,buffer) {
    var c = JSON.parse(buffer),
      // create this array based on those that have "default" eh?
      b = ['asOfDate','series'];

    for (var i in b) {
      var k = b[i],
        re = new RegExp("~"+k, "g");

      // set the value of config element c[k]
      // based on options selected in the ui
      // otherwise default settings
      if (selectedOptions && selectedOptions[k]) {
        var s = selectedOptions[k];

        if (s) { (s instanceof Array) ? c[k].value = s.join(',') : c[k].value = s; }
      } else {
        if (c[k]['default']['value']) {
          c[k].value = c[k]['default']['value'];
        } else if (c[k]['default']['function']) {
          c[k].value = eval(c[k]['default']['function']);
        }
      }

      // replacements based on the value of c[k]
      c = JSON.parse(JSON.stringify(c).replace(re, "'"+c[k].value+"'"));
    }

    results.push(c);
    next(results);
  });

}

function getSeriesData (vname, selectedOptions, next) {
  getSeriesConfig(vname, selectedOptions, function(data) {
    var c = data.shift(),
      // todo: get rid of this ugliness calling a shell script here...
      // if we tuck it away in the config for now at least that gives us options 
      // for calling different stuff...still ugly I know
      csv = spawn('./tsv/mssql.sh', [c.cmd]);

    console.log("baz");
    console.log(c.cmd);

    csv.stdout.on('data', function (data) {
      console.log('stdout: ' + data);
      console.log('buz');
    });

    new lazy(csv.stdout).lines.map(String).map(function (line){
      return line.split(',');
    }).join(function (results) {
      results.unshift(c);
      next(results);
    });
  });
};

function buildSeries (vname, selectedOptions, next) {
  getSeriesData(vname, selectedOptions, function(data) {
    var q = data.shift(), // q for qonfig...hell, running out of letters for my alphabet soup
      header = data[0],
      t = [], // temporary array will have named indexes 
      results = []; // will be sent to next, must be JSON stringifiable

    // todo: need to drive this by the data rather than the config
    // q['xLabs'] = getXlabs(parseDateString(q.fromDate.value), parseDateString(q.untilDate.value));

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

    // finally get the x and y bounds over all series
    var seriesMax = {},
      seriesMin = {},
      xt = [],
      xb = [],
      ylt = [],
      ylb = [],
      yrt = [],
      yrb = [],
      sc = 0,
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

    results.unshift(q);
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
    selectedOptions; // undefined on a get

  // http://howtonode.org/control-flow
  buildSeries(vname, selectedOptions, function(s) {
    fs.writeFile("series.json",JSON.stringify(s));

    var config = s.shift(),
      bounds = s.pop();

    console.log('bar');
    console.log(config);
    console.log('boo');
    console.log(s[0]['data'].slice(0,5));

    res.render('vis', {
      series: s,
      config: config,
      bounds: bounds,
      chartType: 1
    });
  });
});

app.post('/vis/:vname', function(req, res){
  var vname = req.params.vname, 
    selectedOptions = req.body.formOptions;

  console.log('foo');
  console.log(selectedOptions);

  buildSeries(vname, selectedOptions, function(s) {
    var config = s.shift(),
      bounds = s.pop();

    res.render('vis', {
      series: s,
      config: config,
      bounds: bounds,
      chartType: selectedOptions['chartType']
    });
  });
});

app.listen(3000);
console.log("Express server listening on port %d in %s mode", app.address().port, app.settings.env);
