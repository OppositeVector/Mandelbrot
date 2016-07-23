// mfm 2014-06-07 how fast is mandelbrot in node.js?
// NB this is no multithreaded, not sure how we'd share
// cache across processes, one way might be to have a single
// thread serving pages, and the others serving images??
// for the moment we'll keep single threaded

// http://localhost:8080/-1/1/-1/1/1000
var PNG = require('node-png').PNG;

exports.GetMandelbrotPicture =  function make_mandel(w, h, iters, sx, ex, sy, ey) {
	var p = new PNG({
		filterType: -1,
		width: w,
		height: h
	})
	var dx = (ex-sx) / p.width
	var dy = (ey-sy) / p.height
	
	var fy=sy;
	for(var j=0; j<p.height; j++) {
		var fx=sx;
		for (var i=0; i<p.width; i++) {
			var re=fx, im=fy
			var v = 0;
			for( ; v<iters && (re * re + im * im) < 4; v++)  {
				var ore = re
				re = fx + re * re - im * im;
				im = fy + 2 * ore * im;
			}
			v = iters-v  // if we reach max iters this is always 0
			var idx = (j*p.width + i) << 2

			var color = coloring(v, iters);

			p.data[idx] = color[0]
			p.data[idx+1] = color[1]
			p.data[idx+2] = color[2]
			p.data[idx+3] = 0xFF
			fx += dx
		}
		fy += dy
	}
	return p
}

function coloring(iteration, maxIterations){

	if(iteration < maxIterations && iteration > 0){

		var i = Math.floor(iteration % (colorMap.length-1));
		var color1 = colorMap[i];
		var color2 = colorMap[i+1];

		var alpha = iteration % 1

		var r = Math.round(lerp(color1[0], color2[0], alpha));
		var g = Math.round(lerp(color1[1], color2[1], alpha));
		var b = Math.round(lerp(color1[2], color2[2], alpha));
		return [r,g,b];
	}else{
		return [0,0,0];
	}


}
var colorMap = [
	[0,0,255], 
	[17,17,255], 
	[34,34,255], 
	[51,51,255], 
	[68,68,255], 
	[85,85,255], 
	[102,102,255], 
	[119,119,255], 
	[136,136,255], 
	[153,153,255], 
	[170,170,255], 
	[187,187,255], 
	[204,204,255], 
	[221,221,255], 
	[238,238,255], 
	[255,255,255], 
	[255,255,255], 
	[238,238,255], 
	[221,221,255], 
	[204,204,255], 
	[187,187,255], 
	[170,170,255], 
	[153,153,255], 
	[136,136,255], 
	[119,119,255], 
	[102,102,255], 
	[85,85,255], 
	[68,68,255], 
	[51,51,255], 
	[34,34,255], 
	[17,17,255], 
	[0,0,255] 
];

function lerp(v0,v1,t){return (1-t)*v0+t*v1;}

function OldServerCreate(req, res) {
	res.writeHead(200, {'Content-Type': 'image/png'});


	var parts = req.url.split("/"),
		sx = parseFloat(parts[1]),
		ex = parseFloat(parts[2]),
		sy = parseFloat(parts[3]),
		ey = parseFloat(parts[4]),
		max_iter = parseFloat(parts[5]);
		width = parseInt(parts[6]);
		height= parseInt(parts[7]);

	console.log("Requesting "+sx+", "+ex+", "+sy+", "+ey+", "+max_iter)
	var p = make_mandel(width, height, max_iter, sx, ex, sy, ey);
	var bufs=[]
	p.pack().on('data', function(data) {
		bufs.push(data)
	}).on('end', function(data) {
		if(data)
			bufs.push(data)
		ret = Buffer.concat(bufs)
		res.end(ret)
	})
}

//var p = make_mandel(256, 256, 64, -1.0, 1.0, -1.0, 1.0)
//p.pack().pipe(fs.createWriteStream('out.png'));