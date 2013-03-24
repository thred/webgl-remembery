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

THREE.Object3D.prototype.animateDancing = function(time, offset, jumpHeight, rotation) {
	if (!this.visible) {
		return;
	}

	rotation = rotation || (1 / 2);

	var anim = time * 7 - offset * Math.PI / 4;

	this.position.y = Math.abs(Math.sin(anim) * jumpHeight);
	this.rotation.y = Math.sin(anim / 4) * rotation;
	this.rotation.z = Math.cos(anim) / 8;
	this.scale.y = 1 + Math.sin(anim * 2 - Math.PI / 4) / 16;
};

THREE.Camera.prototype.locateTween = function(lookAtVector, direction, distance, theta, duration) {
	var self = this;

	var from = {
		viewX: this.lookingAt.x,
		viewY: this.lookingAt.y,
		viewZ: this.lookingAt.z,
		dir: this.direction,
		dist: this.distance,
		t: this.theta
	};
	var to = {
		viewX: lookAtVector.x,
		viewY: lookAtVector.y,
		viewZ: lookAtVector.z,
		dir: direction,
		dist: distance,
		t: theta
	};
	var update = function() {
			self.locate(new THREE.Vector3(this.viewX, this.viewY, this.viewZ), this.dir, this.dist, this.t);
		};

	return new TWEEN.Tween(from).to(to, duration / $.SPEED).easing(TWEEN.Easing.Cubic.InOut).interpolation(TWEEN.Interpolation.Bezier).onUpdate(update);
};

THREE.Object3D.prototype.moveTween = function(fromPosition, toPosition, duration) {
	var self = this;

	var from = {
		posX: fromPosition.x,
		posY: fromPosition.y,
		posZ: fromPosition.z
	};
	var to = {
		posX: toPosition.x,
		posY: toPosition.y,
		posZ: toPosition.z
	};
	var start = function() {
			self.setVisible(true);
		};
	var update = function() {
			self.position.set(this.posX, this.posY, this.posZ);
		};

	return new TWEEN.Tween(from).to(to, duration / $.SPEED).easing(TWEEN.Easing.Elastic.Out).onStart(start).onUpdate(update);
};

THREE.Object3D.prototype.growTween = function(duration) {
	var self = this;

	var from = {
		scaleX: 0,
		scaleY: 0,
		scaleZ: 0
	};
	var to = {
		scaleX: this.scale.x,
		scaleY: this.scale.y,
		scaleZ: this.scale.z
	};
	var start = function() {
			self.setVisible(true);
			$.WORLD.playSound("grow", self.position, 4);
		};
	var update = function() {
			self.scale.set(this.scaleX, this.scaleY, this.scaleZ);
		};

	return new TWEEN.Tween(from).to(to, duration / $.SPEED).easing(TWEEN.Easing.Elastic.Out).onStart(start).onUpdate(update);
};

THREE.Object3D.prototype.starTween = function(duration) {
	var self = this;

	var from = {
		scaleX: 0,
		scaleY: 0,
		scaleZ: 0
	};
	var to = {
		scaleX: this.scale.x,
		scaleY: this.scale.y,
		scaleZ: this.scale.z
	};
	var start = function() {
			self.setVisible(true);
			$.WORLD.playSound("applause");
		};
	var update = function() {
			self.scale.set(this.scaleX, this.scaleY, this.scaleZ);
		};

	return new TWEEN.Tween(from).to(to, duration / $.SPEED).easing(TWEEN.Easing.Elastic.Out).onStart(start).onUpdate(update);
};

THREE.Object3D.prototype.shrinkTween = function(duration) {
	var self = this;
	var base = self.scale.clone();

	var from = {
		scaleX: this.scale.x,
		scaleY: this.scale.y,
		scaleZ: this.scale.z
	};
	var to = {
		scaleX: 0,
		scaleY: 0,
		scaleZ: 0
	};
	var update = function() {
			self.scale.set(this.scaleX, this.scaleY, this.scaleZ);
		};
	var complete = function() {
			self.setVisible(false);
			self.scale = base;
		};

	return new TWEEN.Tween(from).to(to, duration / $.SPEED).easing(TWEEN.Easing.Cubic.Out).onUpdate(update).onComplete(complete);
};

THREE.Object3D.prototype.bounceInTween = function(fromPosition, toPosition, duration, height) {
	var self = this;
	var sound = 0;
	height = height || 32;

	var from = {
		posX: fromPosition.x,
		posY: fromPosition.y,
		posZ: fromPosition.z,
		fact: 0
	};
	var to = {
		posX: toPosition.x,
		posY: toPosition.y,
		posZ: toPosition.z,
		fact: 1
	};
	var start = function() {
			self.setVisible(true);
		};
	var update = function(value) {
			self.position.x = this.posX;
			self.position.y = this.posY;
			self.position.z = this.posZ + height - TWEEN.Easing.Bounce.Out(TWEEN.Easing.Cubic.In(value)) * height;

			if ((this.fact > (1 / 2.75)) && (sound === 0)) {
				sound += 1;
			} else if ((this.fact > (2 / 2.75)) && (sound == 1)) {
				$.WORLD.playSound("spring", self.position, 0.5);
				sound += 1;
			} else if ((this.fact > (2.5 / 2.75)) && (sound == 2)) {
				$.WORLD.playSound("spring", self.position, 0.2);
				sound += 1;
			}
		};

	return new TWEEN.Tween(from).to(to, duration / $.SPEED).easing(TWEEN.Easing.Cubic.Out).onStart(start).onUpdate(update);
};

THREE.Object3D.prototype.blowTween = function(bubbles, radius) {
	bubbles = bubbles || ($.HI) ? 20 : 5;
	radius = radius || 10;

	var self = this;
	var base = self.scale.clone();

	var from = {
		scaleX: self.scale.x,
		scaleY: self.scale.y,
		scaleZ: self.scale.z
	};
	var to = {
		scaleX: self.scale.x * 3,
		scaleY: self.scale.y * 3,
		scaleZ: self.scale.z * 3
	};
	var update = function() {
			self.scale.set(this.scaleX, this.scaleY, this.scaleZ);
		};
	var complete = function() {
			self.setVisible(false);

			var rnd = Math.random();

			if (rnd < 0.33) {
				$.WORLD.playSound("bubble0");
			} else if (rnd < 0.66) {
				$.WORLD.playSound("bubble1");
			} else {
				$.WORLD.playSound("bubble2");
			}

			for (var i = 0; i < bubbles; i += 1) {
				$.MAIN.getController("firework").bubble(self.position, radius);
			}

			self.scale = base;
		};

	return new TWEEN.Tween(from).to(to, 250 / $.SPEED).onUpdate(update).onComplete(complete);
};