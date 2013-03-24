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

$.Main.prototype.load = function(loadingMonitor) {
	$.WORLD.addSound("bubble0", "asset/bubble0.ogg", loadingMonitor);
	$.WORLD.addSound("bubble1", "asset/bubble1.ogg", loadingMonitor);
	$.WORLD.addSound("bubble2", "asset/bubble2.ogg", loadingMonitor);
	$.WORLD.addSound("spring", "asset/spring.ogg", loadingMonitor);
	$.WORLD.addSound("grow", "asset/grow.ogg", loadingMonitor);
	$.WORLD.addSound("flip", "asset/flip.ogg", loadingMonitor);
	$.WORLD.addSound("yeah", "asset/yeah.ogg", loadingMonitor);
	$.WORLD.addSound("point", "asset/point.ogg", loadingMonitor);
	$.WORLD.addSound("applause", "asset/applause.ogg", loadingMonitor);

	for (var name in this.controllers) {
		this.controllers[name].load(loadingMonitor);
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