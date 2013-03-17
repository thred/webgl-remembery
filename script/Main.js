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
	$.WORLD.addSound("flip", "asset/flip.ogg");
	$.WORLD.addSound("yeah", "asset/yeah.ogg");
	$.WORLD.addSound("point", "asset/point.ogg");

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

$.Main.prototype.activateController = function(controllerName, delay) {
	delay = delay || 0;

	var controller = this.getController(controllerName);

	this.activeControllers.push(controller);

	this.schedule(this, function() {
		controller.activate();
	}, delay);
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
	if (delay > 0) {
		new TWEEN.Tween(0).onComplete(function() {
			func.call(object);
		}).delay(delay / $.SPEED).start();
	} else {
		func.call(object);
	}
};