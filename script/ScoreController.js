/**
 * Copyright 2013 Manfred Hantschel
 * 
 * This file is part of WebGL-Remembery.
 * 
 * WebGL-Remembery is free software: you can redistribute it and/or modify
 * it under the terms of the GNU General Public License as published by
 * the Free Software Foundation, either version 3 of the License, or
 * (at your option) any later version.
 * 
 * WebGL-Remembery is distributed in the hope that it will be useful,
 * but WITHOUT ANY WARRANTY; without even the implied warranty of
 * MERCHANTABILITY or FITNESS FOR A PARTICULAR PURPOSE. See the
 * GNU General Public License for more details.
 * 
 * You should have received a copy of the GNU General Public License
 * along with WebGL-Remembery. If not, see <http://www.gnu.org/licenses/>.
 */

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
	
	var dings = this.score / this.maxScore * 31;
	
	var stars = 0;
	
	if (dings >= 30) {
		stars = 5;
	}
	else if (dings >= 28) {
		stars = 4;
	}
	else if (dings >= 24) {
		stars = 3;
	}
	else if (dings >= 16) {
		stars = 2;
	}
	else {
		stars = 1;
	}
	
	$.MAIN.schedule(this, function() {
		this.view.showStars(stars);
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
				next = Util.round(this.value + 25, 0, 25);
			}
		};

	return new TWEEN.Tween(from).to(to, 3000 / $.SPEED).onUpdate(update);
};

$.ScoreController.prototype.onPlay = function() {
	$.MAIN.inactivateController("board");
	$.MAIN.inactivateController("score");
	$.MAIN.activateController("size", 250);
};