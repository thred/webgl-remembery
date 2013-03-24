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

$.FireworkView = function() {
	$.View.call(this);

	this.objects = [];
};

$.FireworkView.prototype = Object.create($.View.prototype);

$.FireworkView.prototype.load = function(loadingMonitor) {
	this.bubbleBoundsGeometry = new THREE.PlaneGeometry(2, 2, 1, 1);
	this.bubbleBoundsTexture = Util.createTexturedMaterial('asset/bubbleBounds.png', loadingMonitor, 1, true, 0.5);
	this.bubbleBoundsTexture.depthTest = false;
	
	if ($.HI) {
		this.bubbleGeometry = new THREE.SphereGeometry(1, 8, 4);
		this.bubbleTexture = Util.createTexturedMaterial('asset/bubble.png', loadingMonitor, 1, true, 0.5);
		this.bubbleTexture.blending = THREE.AdditiveBlending;
		this.bubbleTexture.side = THREE.DoubleSide;
		this.bubbleTexture.depthTest = false;
	}
};

$.FireworkView.prototype.animate = function(time, duration) {
	for (var i = 0; i < this.objects.length; i += 1) {
		this.objects[i].animate(time, duration);
	}
};

$.FireworkView.prototype.bubble = function(position, radius, maxSize) {
	var bubbleObject = new $.Bubble(this, this.bubbleBoundsGeometry, this.bubbleBoundsTexture, this.bubbleGeometry, this.bubbleTexture, position, radius, maxSize);

	this.addObject(bubbleObject);
};

$.FireworkView.prototype.addObject = function(object) {
	this.objects.push(object);
	$.WORLD.addObject(object);
};

$.FireworkView.prototype.removeObject = function(object) {
	this.objects.splice(this.objects.indexOf(object), 1);
	$.WORLD.removeObject(object);
};