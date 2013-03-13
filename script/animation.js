THREE.Object3D.prototype.animateDancing = function(time, offset, jumpHeight) {
	var anim = time / 150 - offset * Math.PI / 4;

	this.position.y = Math.abs(Math.sin(anim) * jumpHeight);
	this.rotation.y = Math.sin(anim / 4) / 2;
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

	return new TWEEN.Tween(from).to(to, duration * $.SPEED).easing(TWEEN.Easing.Cubic.InOut).interpolation(TWEEN.Interpolation.Bezier).onUpdate(update);
};

THREE.Object3D.prototype.growTween = function(duration) {
	var self = this;
	var baseRotation = this.rotation.z;

	var from = {
		scaleX: 0,
		scaleY: 0,
		scaleZ: 0,
		fact: 0
	};
	var to = {
		scaleX: this.scale.x,
		scaleY: this.scale.y,
		scaleZ: this.scale.z,
		fact: 1
	};
	var start = function() {
			self.setVisible(true);
			$.play("grow", self.position, 4);
		};
	var update = function() {
			self.rotation.z = baseRotation + TWEEN.Easing.Quartic.Out(this.fact) * Math.PI * 2;
			self.scale.set(TWEEN.Easing.Elastic.Out(this.scaleX), TWEEN.Easing.Elastic.Out(this.scaleY), TWEEN.Easing.Elastic.Out(this.scaleZ));
		};

	return new TWEEN.Tween(from).to(to, duration).onStart(start).onUpdate(update);
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
				// $.play("spring");
				sound += 1;
			} else if ((this.fact > (2 / 2.75)) && (sound == 1)) {
				$.play("spring", self.position, 0.5);
				sound += 1;
			} else if ((this.fact > (2.5 / 2.75)) && (sound == 2)) {
				$.play("spring", self.position, 0.2);
				sound += 1;
			}

			// if ((this.fact < (1 / 2.75)) && (sound == 2)) {
			// $.play("spring");
			// sound += 1;
			// $.message(sound);
			// } else if ((this.fact < (2 / 2.75)) && (sound == 1)) {
			// $.play("spring");
			// sound += 1;
			// $.message(sound);
			// } else if ((this.fact < (2.5 / 2.75)) && (sound == 0)) {
			// $.play("spring");
			// sound += 1;
			// $.message(sound);
			// }
		};

	return new TWEEN.Tween(from).to(to, duration).easing(TWEEN.Easing.Cubic.Out).onStart(start).onUpdate(update);
};

THREE.Object3D.prototype.blowTween = function(bubbles, radius) {
	bubbles = bubbles || 20;
	radius = radius || 10;

	var self = this;

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
				$.play("bubble0");
			} else if (rnd < 0.66) {
				$.play("bubble1");
			} else {
				$.play("bubble2");
			}

			for (var i = 0; i < bubbles; i += 1) {
				$.firework.bubble(self.position, radius);
			}
		};

	return new TWEEN.Tween(from).to(to, 250 * $.SPEED).onUpdate(update).onComplete(complete);
};

THREE.Object3D.prototype.raceOutTween = function(fromPosition, toPosition, duration) {
	var self = this;

	var from = {
		posX: fromPosition.x,
		posY: fromPosition.y,
		posZ: fromPosition.z,
		rot: self.rotation.z
	};
	var to = {
		posX: toPosition.x,
		posY: toPosition.y,
		posZ: toPosition.z,
		rot: self.rotation.z + Math.PI * 16
	};
	var update = function(value) {
			self.position.x = this.posX;
			self.position.y = this.posY;
			self.position.z = this.posZ;
			self.rotation.z = this.rot;
		};

	return new TWEEN.Tween({
		rot: self.rotation.z
	}).to({
		rot: self.rotation.z + Math.PI * 8
	}, duration / 3).onUpdate(function(value) {
		self.rotation.z = this.rot;
	}).chain(new TWEEN.Tween(from).to(to, duration).easing(TWEEN.Easing.Cubic.Out).onUpdate(update));
};