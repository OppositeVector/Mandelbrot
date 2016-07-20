var app = angular.module('visualizer', []);

app.controller('mainController', function($scope, $http) {

	var toolbox = $('aside');
	var wrapper = $('#wrapper');

	console.log("HERE");
	$scope.MouseEnter = function() {
		console.log("ENTER");
		if(toolbox.hasClass("hidden")) {
			toolbox.toggleClass("hidden");
		}
	}
	$scope.MouseLeave = function() {
		console.log("LEAVE")
		if(!toolbox.hasClass("hidden")) {
			toolbox.toggleClass("hidden");
		}
	}
	$http({
		url: "CalculateFunction?iterations=500&xParts=" + wrapper.width() + "&yParts=" + wrapper.height() + "&zoom=1",
		method: "GET"
	}).success(function(data) {
		console.log(data);
		$scope.data = data;
	}).error(function(err) {
		console.log(err);
	});

});