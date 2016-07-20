var express = require('express');
var url = require('url');
var mandlebrot = require('./mandelbrot');

var app = express();

// app.use(bodyParser.urlencoded({ extended: false }));

app.use('/', express.static('./public'));

app.get('/CalculateFunction', function(req, res) {

	var body = url.parse(req.url, true).query;
	console.log(body);
	var iters = body.iterations;
	var x = body.xParts;
	var y = body.yParts;
	var zoom = body.zoom;
	
	if(iters && x && y && zoom) {
		var dx = ((x > y) ? 1 : x / y) / zoom;
		var dy = ((y > x) ? 1 : y / x) / zoom;
		var p = mandlebrot.GetMandlebrotPicture(x, y, iters, -dx, dx, -dy, dy);
		var bufs=[]

		p.pack().on('data', function(data) {
			bufs.push(data)
		}).on('end', function(data) {
			
			console.log(base64Image);
			if(data)
				bufs.push(data)
			var base64Image = new Buffer(bufs, 'binary').toString('base64');
			ret = Buffer.concat(bufs)
			res.end(ret)
		});
	} else {
		res.json({ result: false, data: 'Not all parameters populated' });
	}

});

var port = process.env.PORT || 3000;

app.listen(port);
console.log('Listening on port ' + port);