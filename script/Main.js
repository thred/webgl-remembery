$.Main = function() {
	this.fireworkController = new $.FireworkController();
	this.introController = new $.IntroController();
	this.sizeController = new $.SizeController();
	this.boardController = new $.BoardController();
};

$.Main.prototype.load = function() {
	$.WORLD.addSound("bubble0", "asset/bubble0.ogg");
	$.WORLD.addSound("bubble1", "asset/bubble1.ogg");
	$.WORLD.addSound("bubble2", "asset/bubble2.ogg");
	$.WORLD.addSound("spring", "asset/spring.ogg");
	$.WORLD.addSound("grow", "asset/grow.ogg");

	this.fireworkController.load();
	this.introController.load();
	this.sizeController.load();
	this.boardController.load();
};

$.Main.prototype.activate = function() {
	this.fireworkController.activate();
	this.introController.activate();
};

$.Main.prototype.schedule = function(object, func, delay) {
	new TWEEN.Tween(0).onComplete(function() {
		func.call(object);
	}).delay(delay / $.SPEED).start();
};