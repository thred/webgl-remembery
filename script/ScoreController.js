$.ScoreController = function() {
	$.Controller.call(this);

	this.view = new $.ScoreView(this);
};

$.ScoreController.prototype = Object.create($.Controller.prototype);

$.ScoreController.prototype.load = function(loadingMonitor) {
	this.view.load(loadingMonitor);
};

$.ScoreController.prototype.activate = function() {
	$.WORLD.addView(this.view);

	this.countScoreTween().delay(3000 / $.SPEED).start();

	$.MAIN.schedule(this, function() {
		this.view.showStars(Math.round(this.score / this.maxScore * 5));
	}, 6000);
};

$.ScoreController.prototype.inactivate = function() {
	$.WORLD.removeView(this.view, 250);
};

$.ScoreController.prototype.countScoreTween = function() {
	var self = this;
	var next = 10;

	var from = {
		value: 0
	};
	var to = {
		value: this.score
	};
	var update = function() {
			self.view.scoreObject.score(Math.round(this.value), self.maxScore);
			
			if (this.value > next) {
				$.WORLD.playSound("point");
				next = Util.round(this.value + 10, 0, 10);
			}
		};

	return new TWEEN.Tween(from).to(to, 3000 / $.SPEED).onUpdate(update);
};

$.ScoreController.prototype.onPlay = function() {
	$.MAIN.inactivateController("board");
	$.MAIN.inactivateController("score");
	$.MAIN.activateController("size", 250);
};