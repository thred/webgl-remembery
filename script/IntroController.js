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

$.IntroController = function() {
	$.Controller.call(this);

	this.view = new $.IntroView(this);
};

$.IntroController.prototype = Object.create($.Controller.prototype);

$.IntroController.prototype.load = function(loadingMonitor) {
	this.view.load(loadingMonitor);
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