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

$.SizeView = function(controller) {
	$.View.call(this, controller);

	this.buttonObjects = [];
};

$.SizeView.prototype = Object.create($.View.prototype);


$.SizeView.prototype.BUTTONS = [{
	texture: 'asset/xsmall.png',
	color: 0xcc00ff
}, {
	texture: 'asset/small.png',
	color: 0x4400aa
}, {
	texture: 'asset/medium.png',
	color: 0x2ca05a
}, {
	texture: 'asset/large.png',
	color: 0xd45500
}, {
	texture: 'asset/xlarge.png',
	color: 0x782121
}];

$.SizeView.prototype.load = function(loadingMonitor) {
	for (var i = 0; i < this.BUTTONS.length; i += 1) {
		this.buttonObjects[i] = this.loadButton(loadingMonitor, this.BUTTONS[i], i);
		this.buttonObjects[i].index = i;
		$.WORLD.addObject(this.buttonObjects[i]);
	}
};

$.SizeView.prototype.loadButton = function(loadingMonitor, button, index) {
	var object = new $.Button(button.texture, loadingMonitor, button.color);
	var x = (index - 2) * 20;

	object.setVisible(false);
	object.scale.set(15, 15, 15);
	object.startPosition = new THREE.Vector3(100 + x, - 5, 0);
	object.showPosition = new THREE.Vector3(x, - 5, 0);

	return object;
};

$.SizeView.prototype.activate = function() {
	$.WORLD.camera.locateTween(new THREE.Vector3(0, 0, 0), 0, $.WORLD.camera.computeDistance(100, 30), 0,
	2000).start();

	for (var i = 0; i < this.buttonObjects.length; i += 1) {
		this.buttonObjects[i].bounceInTween(this.buttonObjects[i].startPosition, this.buttonObjects[i].showPosition,
		3000).delay(i * 100 / $.SPEED).start();

		$.WORLD.addClickable(this.buttonObjects[i].children[0], this, this.onButtonClick);
	}
};

$.SizeView.prototype.inactivate = function() {
};

$.SizeView.prototype.onButtonClick = function(mesh) {
	$.WORLD.removeClickable(mesh);
	mesh.parent.blowTween().start();

	for (var i = 0; i < this.buttonObjects.length; i += 1) {
		if (this.buttonObjects[i].visible) {
			this.buttonObjects[i].blowTween(5).delay(500 / $.SPEED + i * 75 / $.SPEED).start();
			$.WORLD.removeClickable(this.buttonObjects[i].children[0]);
		}
	}

	this.controller.onSelect(mesh.parent.index);
};

$.SizeView.prototype.animate = function(time) {
	for (var i = 0; i < this.buttonObjects.length; i += 1) {
		this.buttonObjects[i].children[0].animateDancing(time, i, 0.15);
	}
};