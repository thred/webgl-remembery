var $ = $ || {

};

$.init = function() {
	$.SPEED = 1;
	$.WORLD = new $.World();
	$.MAIN = new $.Main();
	$.lastTime = new Date().getTime();

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
	$.MAIN.start();
};

$.animate = function(time) {
	requestAnimationFrame($.animate);

	time = time / 1000 * $.SPEED;
	var duration = time - $.lastTime;
	
	$.MAIN.animate(time, duration);
	$.WORLD.animate(time, duration);
	
	TWEEN.update();

	$.lastTime = time;
};

$.message = function(message) {
	document.getElementById('message').innerHTML = message;
};
