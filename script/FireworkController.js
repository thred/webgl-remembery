$.FireworkController = function() {
	$.Controller.call(this);

	this.view = new $.FireworkView();
};

$.FireworkController.prototype = Object.create($.Controller.prototype);

$.FireworkController.prototype.load = function() {
	this.view.load();
};

$.FireworkController.prototype.activate = function() {
	$.WORLD.addView(this.view);
};

$.FireworkController.prototype.bubble = function(position, radius, maxSize) {
	this.view.bubble(position, radius, maxSize);
};


