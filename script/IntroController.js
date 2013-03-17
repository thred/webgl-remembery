$.IntroController = function() {
	$.Controller.call(this);

	this.view = new $.IntroView(this);
};

$.IntroController.prototype = Object.create($.Controller.prototype);

$.IntroController.prototype.load = function() {
	this.view.load();
};

$.IntroController.prototype.activate = function() {
	$.WORLD.addView(this.view);
};

$.IntroController.prototype.inactivate = function() {
	$.WORLD.removeView(this.view, 250);
};

$.IntroController.prototype.onPlay = function() {
	$.MAIN.inactivateController("intro");
	$.MAIN.activateController("size", 250);
};