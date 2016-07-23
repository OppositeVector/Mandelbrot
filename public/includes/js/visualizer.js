var app = angular.module('visualizer', []);

var toolbox = $('aside');
var wrapper = $('#wrapper');
var body = $('body');
var canvas = $('canvas');
var ctx = canvas[0].getContext("2d");
ctx.lineWidth = 15;
ctx.strokeStyle = '#ffffff';

// function ImageData(mipLevel, pos) {
// 	this.loaded = false;
// 	var self = this;
// 	this.img = new Image;
// 	this.img.src = "GetFragment?iterations=500&xPos=" + pos.x + "&yPos=" + pos.y + "&step=" + (1 / mipLevel) * 2;
// 	this.img.onload = function() { self.loaded = true; }
// 	this.PrintOut = function() { console.log(self.img); }
// 	this.mip = mipLevel;
// 	this.pos = pos;
// }

// function ImageController(ctx) {

// 	var self = this;
// 	var blockSize = 200;
// 	var viewport = {
// 		x: 0,
// 		y: 0,
// 		zoom: 1,
// 		pixelDims: { width: body.width(), height: body.height() },
// 		aspectRatio: body.width() / body.height(),
// 		center: { x: body.width() / 2, y: body.height() / 2}
// 	}

// 	console.log(viewport);

// 	this.Blit = function(imageData) {
// 		var x = viewport.center.x + (((viewport.x + imageData.pos.x) * (blockSize * viewport.zoom)) / (2 * imageData.mip));
// 		var y = viewport.center.y + (((viewport.y + imageData.pos.y) * (blockSize * viewport.zoom)) / (2 * imageData.mip));
// 		x = Math.floor(x);
// 		y = Math.floor(y);
// 		var size = blockSize * viewport.zoom / imageData.mip;
// 		// console.log(x + " " + y);
// 		if(imageData.loaded == true) {
// 			ctx.drawImage(imageData.img, x, y, size, size);
// 		}
// 	}

// 	this.AddOffset = function(x, y) {
// 		var xChange = x / 100;
// 		var yChange = y / 100;
// 		// console.log(xChange + " " + yChange);
// 		viewport.x += xChange;
// 		viewport.y += yChange;
// 		// console.log(viewport);
// 	}
// 	this.AddZoom = function(zFactor) {
// 		viewport.zoom += viewport.zoom * zFactor;
// 	}

// 	var root = new ImageData(0.5, { x: -2, y: -2 });
// 	arr = [
// 		new ImageData(1, { x: -2, y: -2 }), 
// 		new ImageData(1, { x: 0, y: -2 }), 
// 		new ImageData(1, { x: -2, y: 0 }), 
// 		new ImageData(1, { x: 0, y: 0 }),
// 		new ImageData(0.5, { x: -2, y: -2 })
// 	]
// 	// root.PrintOut();

// 	var fps = 60;
// 	var now;
// 	var then = Date.now();
// 	var interval = 1000/fps;
// 	var delta;

// 	this.Draw = function() {
     
// 	    requestAnimationFrame(self.Draw);
	     
// 	    now = Date.now();
// 	    delta = now - then;
	     
// 	    if (delta > interval) {
// 	        then = now - (delta % interval);
// 	        ctx.fillRect(0, 0, body.width(), body.height());
// 	        for(var i = 0; i < arr.length; ++i) {
// 	        	self.Blit(arr[i]);
// 	        }
// 	        // self.Blit(root);
// 	        // controller.BlitAll();
// 	    }
// 	}
	 
// 	this.Draw();

// }

// var controller = new ImageController(ctx);

function ImageController(ctx) {
	var blockSize = 200;
	var minY = 0;
	var maxY = 0;
	var offset = { x: 0, y: 0 };
	var zoom = 1;
	var arr = [];
	var self = this;
	this.count = 0;
	function ArrBlock() {
		this.arr = [];
		this.minX = 0;
		this.maxX = 0;
	}
	function GetImage(x, y) {
		yIndex = Math.floor((y - minY) / blockSize);
		// console.log('(' + x + ',' + y +'): yIndex:' + yIndex);
		if((yIndex >= 0) && (yIndex < arr.length)) {
			var block = arr[yIndex];
			var xIndex = Math.floor((x - block.minX) / blockSize);
			// console.log('(' + x + ',' + y +'): xIndex:' + xIndex);
			if((xIndex >= 0) && (xIndex < block.arr.length)) {
				// console.log('returned: yIndex: ' + yIndex + ', xIndex: ' + xIndex);
				return block.arr[xIndex];
			}
		}
		return null;
	}
	function PlaceInArr(img) {
		self.count += 1;
		var yIndex = Math.floor((img.y - minY) / blockSize);
		if(yIndex < 0) {
			minY = img.y;
			for(; yIndex < 0; ++yIndex) {
				arr.unshift(new ArrBlock());
			}
		}
		if(yIndex >= arr.length) {
			maxY = img.y;
			for(; yIndex >= arr.length;) {
				arr.push(new ArrBlock());
			}
		}
		var block = arr[yIndex];
		var xIndex = Math.floor((img.x - block.minX) / blockSize);
		if(xIndex < 0) {
			block.minX = img.x;
			for(; xIndex < 0; ++xIndex) {
				block.arr.unshift(null);
			}
		}
		if(xIndex >= block.arr.length) {
			block.maxX = img.x;
			for(; xIndex >= block.arr.length;) {
				block.arr.push(null);
			}
		}
		block.arr[xIndex] = img;
	}
	this.BlitAll = function() {
		ctx.fillRect(0, 0, body.width(), body.height());
		ctx.lineWidth = 7;
		ctx.strokeStyle = '#ffffff';
		start = { 
			x: Math.floor(-offset.x / blockSize) * blockSize, 
			y: Math.floor(-offset.y / blockSize) * blockSize
		};
		end = { 
			x: start.x + body.width() + blockSize, 
			y: start.y + body.height() + blockSize
		};
		// console.log(JSON.stringify(start) + " " + JSON.stringify(end));
		var ySteps = 0
		var xSteps = 0
		for(var y = start.y; y < end.y; y += blockSize) {
			++ySteps;
			for(var x = start.x; x < end.x; x += blockSize) {
				++xSteps;
				var img = GetImage(x, y);
				if(img == null) {
					// console.log('New Iamge: (' + x + ',' + y + ')');
					img = new this.ImageMeta(ctx, x, y, zoom);
					PlaceInArr(img);
				}
				if(img.zoom != zoom) {
					img.zoom = zoom;
					img.PullPicture();
				}
				img.Blit();
			}
		}
	}
	this.ImageMeta = function(ctx, x, y, z) {
		var loaded = false;
		var loading = 0;
		var self = this;
		this.x = x;
		this.y = y;
		this.zoom = z;
		var circle = {
			x: self.x + (blockSize / 2),
			y: self.y + (blockSize / 2),
			r: 50,
			degs: 0,
			c: false
		}
		this.Blit = function() {
			if(loading == true) {
				circle.degs += 5;
				if(circle.degs >= 360) {
					circle.degs -= 360;
					circle.c = !circle.c;
				}
				console.log(circle);
				ctx.beginPath();
				ctx.arc(circle.x + offset.x, circle.y + offset.y, circle.r, 0, circle.degs * (Math.PI / 180), circle.c);
				ctx.stroke();
			} else if(loaded == true) {
				var size = blockSize;
				ctx.drawImage(self.img, Math.floor(self.x + offset.x), Math.floor(self.y + offset.y), size, size);
			}
		}
		this.PullPicture = function() {
			var xPos = ((self.x / self.zoom) / 2000);
			var yPos = ((self.y / self.zoom) / 2000);
			var step = ((1 / (blockSize / 20)) / self.zoom)
			self.img.src = "GetFragment?iterations=500&xPos=" + xPos + "&yPos=" + yPos + "&step=" + step;
			loading = true;
		}
		this.AddZoom = function(z) {
			self.zoom += z;
		}
		this.img = new Image;
		this.img.onload = function() { loaded = true; loading = false; };
		this.PullPicture();
	}
	this.AddOffset = function(x, y) {
		offset.x += x;
		offset.y += y;
	}
	this.AddZoom = function(z) {
		zoom += zoom * z;
		offset.x += (offset.x * z);
		offset.y += (offset.y * z);
	}
	this.ZoomIn = function() {
		zoom += zoom * 0.1;
		// offset.x -= Math.floor(offset.x * 0.5);
		// offset.y -= Math.floor(offset.y * 0.5);
	}
	this.ZoomOut = function() {
		zoom -= zoom * 0.1;
		// offset.x += Math.floor(offset.x * 0.5);
		// offset.y += Math.floor(offset.y * 0.5);
	}

	var fps = 60;
	var now;
	var then = Date.now();
	var interval = 1000/fps;
	var delta;
	  
	function Draw() {
	     
	    requestAnimationFrame(Draw);
	     
	    now = Date.now();
	    delta = now - then;
	     
	    if (delta > interval) {
	        then = now - (delta % interval);
	        self.BlitAll();
	    }
	}
	 
	Draw();

}

var controller = new ImageController(ctx);

app.controller('mainController', function($scope, $http) {

	ctx.canvas.height = body.height();
    ctx.canvas.width = body.width();
    console.log(wrapper.height() + " " + wrapper.width());
    ctx.fillRect(0, 0, body.width(), body.height());

    // var blockSize = { x: 200, y: 200 }
    // var width = body.width();
    // var height = body.height();
    // var t = { x: (blockSize.x / width), y: (blockSize.y / height) };
    // var z = 3.8;
    // var steps = { x: width / blockSize.x, y: height / blockSize.y };
    
    // for(var i = 0; i < steps.y; ++i) {
    // 	images.push([]);
    // 	for(var j = 0; j < steps.x; ++j) {
    // 		images[i].push(new ImageMeta(
    // 			ctx, 
    // 			j * blockSize.x, 
    // 			i * blockSize.y, 
    // 			"GetFragment?iterations=500&xPos=" + (-1 + (t.x * j)) + "&yPos=" + (-1 + (t.x * i)) + "&zoom=" + z)
    // 		);
    // 	}
    // }
    
    // controller.BlitAll();

    var down = false;
    var pos = { x: 0, y: 0 }

    $(window).mousedown(function(e) {
    	// console.log("Down");
    	down = true;
    	pos.x = e.pageX;
    	pos.y = e.pageY;
    });
    $(window).mouseup(function(e) {
    	// console.log("Up");
    	down = false;
    });
    $(window).mousemove(function(e) {
    	if(down) {
    		controller.AddOffset(e.pageX - pos.x, e.pageY - pos.y);
    		pos.x = e.pageX; 
    		pos.y = e.pageY;
    		// controller.BlitAll();
    		// console.log(controller.count);
    		// console.log("moving");
    	}
    })
    // var img = new Image;
    // img.onload = function() {
    // 	ctx.drawImage(img, 0, 0, 100, 100);
    // }
    // img.src = "GetFragment?iterations=500&xPos=-1&yPos=-1&zoom=0.5";

    // $http({
    // 	url: "GetFragment?iterations=500&xPos=-1&yPos=-1&zoom=0.5",
    // 	method: "GET"
    // }).success(function(data) {
    // 	console.log(data);
    // 	ctx.drawImage(data, 0, 0);
    // }).error(function(err) {
    // 	console.log(err);
    // });

	console.log("HERE");
	$scope.MouseEnter = function() {
		// console.log("ENTER");
		if(toolbox.hasClass("hidden")) {
			toolbox.toggleClass("hidden");
		}
	}

	$scope.MouseLeave = function() {
		// console.log("LEAVE")
		if(!toolbox.hasClass("hidden")) {
			toolbox.toggleClass("hidden");
		}
	}

	$scope.ZoomIn = function() {
		controller.AddZoom(0.4);
		// controller.ZoomIn();
		// controller.BlitAll();
	}

	$scope.ZoomOut = function() {
		controller.AddZoom(-0.4);
		// controller.ZoomOut();
		// controller.BlitAll();
	}

	$(window).resize(function(){
		console.log("Resize: " + wrapper.height() + " " + wrapper.width());
		ctx.canvas.height = body.height();
        ctx.canvas.width = body.width();
        // ctx.fillRect(0, 0, body.width(), body.height());

		// $http({
		// 	url: "CalculateFunction?iterations=500&xParts=2&yParts=2&zoom=1&resx=" + wrapper.width() + "&resy=" + wrapper.height(),
		// 	method: "GET"
		// }).success(function(data) {
		// 	console.log(data);
		// 	// $scope.data = data;
		// }).error(function(err) {
		// 	console.log(err);
		// });
	 //    $scope.$apply(function(){
	       
	 //    });
	});
	// console.log(wrapper.width() + " " + wrapper.height());
	// $http({
	// 	url: "CalculateFunction?iterations=500&xParts=2&yParts=2&zoom=1&resx=" + wrapper.width() + "&resy=" + wrapper.height(),
	// 	method: "GET"
	// }).success(function(data) {
	// 	console.log(data);
	// 	$scope.data = data[0][0].toString("base64");
	// }).error(function(err) {
	// 	console.log(err);
	// });

});