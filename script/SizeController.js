$.SizeController = function() {
	$.Controller.call(this);

	this.view = new $.SizeView(this);
};

$.SizeController.prototype = Object.create($.Controller.prototype);

$.SizeController.prototype.BOARD_SIZES = [{
	width: 2,
	height: 1
}, {
	width: 6,
	height: 3
}, {
	width: 6,
	height: 4
}, {
	width: 6,
	height: 6
}, {
	width: 8,
	height: 6
}];

$.SizeController.prototype.load = function() {
	this.view.load();
};

$.SizeController.prototype.activate = function() {
	$.WORLD.addView(this.view);
};

$.SizeController.prototype.inactivate = function() {
	$.WORLD.removeView(this.view);
};

$.SizeController.prototype.onSelect = function(index) {
	$.MAIN.getController("board").boardSize = this.BOARD_SIZES[index];

	$.MAIN.schedule(this, function() {
		$.MAIN.inactivateController("size");
		$.MAIN.activateController("board");
	}, 250);
};