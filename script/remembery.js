var $ = $ || {

};

$.init = function() {
	$.SPEED = 1;
	$.WORLD = new $.World();
	$.MAIN = new $.Main();
	$.lastTime = 0;

	document.addEventListener('mousedown', function(event) {
		$.WORLD.onDocumentMouseDown.call($.WORLD, event);
	}, false);

	document.addEventListener('mousemove', function(event) {
		$.WORLD.onDocumentMouseMove.call($.WORLD, event);
	}, false);

	window.addEventListener('resize', function(event) {
		$.WORLD.onWindowResize.call($.WORLD, event);
	}, false);

	$.MAIN.load();
	$.MAIN.activate();
};

$.animate = function(time) {
	requestAnimationFrame($.animate);

	time = time / 1000;

	if ($.lastTime !== 0) {
		$.WORLD.animate(time, time - $.lastTime);
		TWEEN.update();
	}

	$.lastTime = time;
};

$.message = function(message) {
	document.getElementById('message').innerHTML = message;
};



/*
$.load = function() {

	this.firework.load();
	for (var name in $.pages) {
		$.pages[name].load();
	}
};


*/