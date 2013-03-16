$.ScoreController = function() {
	$.Controller.call(this);

	this.view = new $.ScoreView(this);
};

$.ScoreController.prototype = Object.create($.Controller.prototype);

$.ScoreController.prototype.load = function() {
	this.view.load();
};

$.ScoreController.prototype.activate = function() {
	$.WORLD.addView(this.view);

	this.countScoreTween().delay(3000 / $.SPEED).start();

	$.MAIN.schedule(this, function() {
		this.view.showStars(Math.round(this.score / this.maxScore * 5));
	}, 6000);
};

$.ScoreController.prototype.inactivate = function() {
	$.WORLD.removeView(this.view);
};

$.ScoreController.prototype.countScoreTween = function() {
	var self = this;

	var from = {
		value: 0
	};
	var to = {
		value: this.score
	};
	var update = function() {
			self.view.scoreObject.score(Math.round(this.value), self.maxScore);
		};

	return new TWEEN.Tween(from).to(to, 3000 / $.SPEED).onUpdate(update);
};

$.ScoreController.prototype.onPlay = function() {
	$.MAIN.schedule(this, function() {
		$.MAIN.inactivateController("board");
		$.MAIN.inactivateController("score");
		$.MAIN.activateController("size");
	}, 250);
};

