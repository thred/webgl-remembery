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

$.SizeController.prototype.load = function(loadingMonitor) {
	this.view.load(loadingMonitor);
};

$.SizeController.prototype.activate = function() {
	$.WORLD.addView(this.view);
};

$.SizeController.prototype.inactivate = function() {
	$.WORLD.removeView(this.view, 250);
};

$.SizeController.prototype.onSelect = function(index) {
	$.MAIN.getController("board").boardSize = this.BOARD_SIZES[index];
	$.MAIN.inactivateController("size");
	$.MAIN.activateController("board", 250);
};