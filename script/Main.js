$.Main = function() {
	this.controllers = {
		"firework": new $.FireworkController(),
		"intro": new $.IntroController(),
		"size": new $.SizeController(),
		"board": new $.BoardController(),
		"score": new $.ScoreController()
	};
	this.activeControllers = [];
};

$.Main.prototype.load = function() {
	$.WORLD.addSound("bubble0", "asset/bubble0.ogg");
	$.WORLD.addSound("bubble1", "asset/bubble1.ogg");
	$.WORLD.addSound("bubble2", "asset/bubble2.ogg");
	$.WORLD.addSound("spring", "asset/spring.ogg");
	$.WORLD.addSound("grow", "asset/grow.ogg");

	for (var name in this.controllers) {
		this.controllers[name].load();
	}
};

$.Main.prototype.start = function() {
	this.activateController("firework");
	this.activateController("intro");
};

$.Main.prototype.getController = function(controllerName) {
	return this.controllers[controllerName];
};

$.Main.prototype.activateController = function(controllerName) {
	var controller = this.getController(controllerName);

	this.activeControllers.push(controller);
	controller.activate();
};

$.Main.prototype.inactivateController = function(controllerName) {
	var controller = this.getController(controllerName);

	this.activeControllers.splice(this.activeControllers.indexOf(controller), 1);
	controller.inactivate();
};

$.Main.prototype.animate = function(time, duration) {
	for (var i = 0; i < this.activeControllers.length; i += 1) {
		this.activeControllers[i].time = time;
		this.activeControllers[i].animate(time, duration);
	}
};

$.Main.prototype.schedule = function(object, func, delay) {
	new TWEEN.Tween(0).onComplete(function() {
		func.call(object);
	}).delay(delay / $.SPEED).start();
};