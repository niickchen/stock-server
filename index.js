var express = require('express');
var request = require('request');
var parser = require('xml2json');
var bodyParser = require('body-parser');
var http = require('http');

var app = express();
var apiForwardingUrl = '';

app.set('port', process.env.PORT || 3000);

app.use(bodyParser.json()); // support json encoded bodies
app.use(bodyParser.urlencoded({ extended: true })); // support encoded bodies

app.use(function(req, res, next) {
  res.header("Access-Control-Allow-Origin", "*");
  res.header("Access-Control-Allow-Headers", "Origin, X-Requested-With, Content-Type, Accept");
  next();
});

//app.use(express.static(__dirname + '/app'));

app.all("/", function(req, res) {
    res.send("Hello");
});

app.all("/autocomplete", function(req, res) {
    apiForwardingUrl = 'http://dev.markitondemand.com/MODApis/Api/v2/Lookup/json?input=' + req.query.input;
    req.pipe(request(apiForwardingUrl)).pipe(res);
});

app.all("/quote/sma", function(req, res) {
    apiForwardingUrl = 'https://www.alphavantage.co/query?function=SMA&interval=daily&time_period=10&series_type=close&apikey=288NR2PH3B7WSM91&symbol=' + req.query.symbol;
    req.pipe(request(apiForwardingUrl)).pipe(res);
});

app.all("/quote/ema", function(req, res) {
    apiForwardingUrl = 'https://www.alphavantage.co/query?function=EMA&interval=daily&time_period=10&series_type=close&apikey=288NR2PH3B7WSM91&symbol=' + req.query.symbol;
    req.pipe(request(apiForwardingUrl)).pipe(res);
});

app.all("/quote/stoch", function(req, res) {
    apiForwardingUrl = 'https://www.alphavantage.co/query?function=STOCH&interval=daily&apikey=288NR2PH3B7WSM91&slowkmatype=1&slowdmatype=1&symbol=' + req.query.symbol;
    req.pipe(request(apiForwardingUrl)).pipe(res);
});

app.all("/quote/rsi", function(req, res) {
    apiForwardingUrl = 'https://www.alphavantage.co/query?function=RSI&interval=daily&time_period=10&series_type=close&apikey=288NR2PH3B7WSM91&symbol=' + req.query.symbol;
    req.pipe(request(apiForwardingUrl)).pipe(res);
});

app.all("/quote/adx", function(req, res) {
    apiForwardingUrl = 'https://www.alphavantage.co/query?function=ADX&interval=daily&time_period=10&apikey=288NR2PH3B7WSM91&symbol=' + req.query.symbol;
    req.pipe(request(apiForwardingUrl)).pipe(res);
});

app.all("/quote/cci", function(req, res) {
    apiForwardingUrl = 'https://www.alphavantage.co/query?function=CCI&interval=daily&time_period=10&apikey=288NR2PH3B7WSM91&symbol=' + req.query.symbol;
    req.pipe(request(apiForwardingUrl)).pipe(res);
});

app.all("/quote/bbands", function(req, res) {
    apiForwardingUrl = 'https://www.alphavantage.co/query?function=BBANDS&interval=daily&time_period=5&series_type=close&apikey=288NR2PH3B7WSM91&nbdevup=3&nbdevdn=3&symbol=' + req.query.symbol;
    req.pipe(request(apiForwardingUrl)).pipe(res);
});

app.all("/quote/macd", function(req, res) {
    apiForwardingUrl = 'https://www.alphavantage.co/query?function=MACD&interval=daily&series_type=close&apikey=288NR2PH3B7WSM91&symbol=' + req.query.symbol;
    req.pipe(request(apiForwardingUrl)).pipe(res);
});

app.all("/quote/time_series_daily", function(req, res) {
    apiForwardingUrl = 'https://www.alphavantage.co/query?function=TIME_SERIES_DAILY&apikey=288NR2PH3B7WSM91&outputsize=full&symbol=' + req.query.symbol;
    req.pipe(request(apiForwardingUrl)).pipe(res);
});

app.all("/news", function(req, res) {
    apiForwardingUrl = 'https://seekingalpha.com/api/sa/combined/' + req.query.symbol + '.xml';
    request(apiForwardingUrl, function (error, response, body) {
        try {
                res.send(parser.toJson(body)); // send json data
            } catch (e) {
            res.send("{'Error':'Invalid symbol.'}");
        }
    });
});

// post to highcharts then to facebook
app.post("/share/facebook", function(req, res) {
         //1236548869780321
    //FB.setAccessToken('access_token');

    var obj = {};
    obj.type = 'image/png';
    obj.options = req.body;
    obj.async = true;
    var post_data = JSON.stringify(obj);

    var post_options = {
      host: 'export.highcharts.com',
      port: '80',
      method: 'POST',
      headers: {
          'Content-Type': 'application/x-www-form-urlencoded',
          'Content-Length': Buffer.byteLength((post_data)),
          'Access-Control-Allow-Origin': '*',
          'Content-Type': 'application/json',
          'Access-Control-Allow-Headers': 'Origin, X-Requested-With, Content-Type, Accept'
      }
    };
    
    var data = [];
    var buffer = Buffer.concat(data);
    var post_req = http.request(post_options, function(response) {
      response.on('data', function (chunk) {
          data.push(chunk);
      }).on('end', function() {
        buffer = Buffer.concat(data);
        var link = 'https://export.highcharts.com/' + buffer.toString();
        res.send({'link':link});
      });
    });
    
    
    
    post_req.write(post_data);
    post_req.end();
    
 });

app.listen(app.get('port'));