var express = require('express');
var url = require('url');
var mandelbrot = require('./mandelbrot');

var app = express();

// app.use(bodyParser.urlencoded({ extended: false }));

app.use('/', express.static('./public'));

app.get('/GetFragment', function(req, res) {
	var body = url.parse(req.url, true).query;
	// console.log(body);
	var iters = parseFloat(body.iterations);
	var reso = { x: 200, y: 200 }
	var pos = { 
		x: parseFloat(body.xPos), 
		y: parseFloat(body.yPos) 
	};
	var step = parseFloat(body.step);
	if((iters !== undefined) && (pos.x !== undefined) && (pos.y !== undefined)) {
		var p = mandelbrot.GetMandelbrotPicture(reso.x, reso.y, iters, pos.x, pos.x + step, pos.y, pos.y + step);
		var bufs = [];
		p.pack().on('data', function(data) {
			bufs.push(data);
		}).on('end', function(data) {
			if(data) {
				bufs.push(data);
			}
			ret = Buffer.concat(bufs);// .toString('base64');
			res.header('content-type', 'image/png');
			res.end(ret);
		})
	} else {
		console.log("undefiend: " + iters + " " + JSON.stringify(pos));
		res.json({ result: false, data: 'Not all parameters populated' });
	}
});

app.get('/CalculateFunction', function(req, res) {

	var body = url.parse(req.url, true).query;
	console.log(body);
	var iters = body.iterations;
	var x = body.xParts;
	var y = body.yParts;
	var zoom = body.zoom;
	var reso = { x: body.resx, y: body.resy };
	
	if(iters && x && y && zoom && reso.x && reso.y) {
		var dims = { x: reso.x / x, y: reso.y / y }
		var dx = ((reso.x > reso.y) ? 1 : (reso.x / reso.y)) / zoom;
		var dy = ((reso.y > reso.x) ? 1 : (reso.y / reso.x)) / zoom;
		var curX = -dx;
		var curY = -dy;
		var xStep = (dx * 2) / x;
		var yStep = (dy * 2) / y;
		var pics = [];
		var i = 0;
		for(; curX < dx; curX += xStep) {
			pics.push([]);
			curY = -dy;
			for(; curY < dy; curY += yStep) {
				console.log(JSON.stringify(dims) + " " + dx + " " + dy + " " + curX + " " + curY + " " + xStep + " " + yStep);
				pics[i].push(mandlebrot.GetMandlebrotPicture(dims.x, dims.y, iters, curX, curX + xStep, curY, curY + yStep));
			}
			++i;
		}
		function Recursive(arr, i, j, cb) {
			if(i < arr.length) {
				if(j < arr[i].length) {
					console.log('pack');
					var bufs = [];
					arr[i][j].pack().on('data', function(data) {
						bufs.push(data);
					}).on('end', function(data) {
						if(data) {
							bufs.push(data);
						}
						arr[i][j] = Buffer.concat(bufs).toString('base64');
						Recursive(arr, i, ++j, cb);
					});
				} else {
					Recursive(arr, ++i, 0, cb);
				}
			} else {
				cb();
			}
		}
		// var p = mandlebrot.GetMandlebrotPicture(x, y, iters, -dx, dx, -dy, dy);
		// var bufs=[]

		// p.pack().on('data', function(data) {
		// 	bufs.push(data)
		// }).on('end', function(data) {
		// 	if(data)
		// 		bufs.push(data)
		// 	ret = Buffer.concat(bufs)
		// 	ret = ret.toString('base64');
		// 	res.header('content-type', 'image/png');
		// 	res.end(ret);
		// });
		console.log(pics);
		Recursive(pics, 0, 0, function() {
			console.log(pics);
			res.json(pics);
		});
	} else {
		res.json({ result: false, data: 'Not all parameters populated' });
	}

});

var port = 3000;

app.listen(port);
console.log('Listening on port ' + port);