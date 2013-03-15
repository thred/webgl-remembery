$.Bubble = function(view, boundsGeometry, boundsTexture, geometry, texture, position, radius, maxSize) {
	maxSize = maxSize || 4;

	THREE.Mesh.call(this, boundsGeometry, boundsTexture);

	this.view = view;
	this.size = Math.random() * (maxSize / 2) + (maxSize / 2);
	this.direction = new THREE.Vector3(Math.random() - 0.5, Math.random() - 0.5, Math.random() - 0.5).normalize();
	this.position = position.clone().add(this.direction.clone().setLength(radius));
	this.scale.set(this.size, this.size, this.size);
	this.velocity = 80;
	this.lifespan = Math.random() * 3;
	this.randomize(20);
	this.offset = Math.random();

	var boundsMesh = new THREE.Mesh(geometry, texture);

	boundsMesh.rotation = new THREE.Vector3((Math.random() - 0.5) * 4 * Math.PI, (Math.random() - 0.5) * 4 * Math.PI, (Math.random() - 0.5) * 4 * Math.PI);
	boundsMesh.rotationVelocity = new THREE.Vector3((Math.random() - 0.5) * Math.PI, (Math.random() - 0.5) * Math.PI, (Math.random() - 0.5) * Math.PI);

	this.add(boundsMesh);
};

$.Bubble.prototype = Object.create(THREE.Mesh.prototype);

$.Bubble.prototype.animate = function(time, duration) {
	this.lifespan -= duration;

	if (this.lifespan < 0) {
		this.burst();
		return;
	}

	this.lookAt($.WORLD.camera.position);

	var sizeDisp = this.size * 0.1 * this.lifespan / 3 * Math.sin((this.offset + time * 10));

	this.scale.x = this.size + sizeDisp;
	this.scale.y = this.size - sizeDisp;
	this.scale.z = this.size + sizeDisp;

	this.children[0].rotation.x += this.children[0].rotationVelocity.x * duration;
	this.children[0].rotation.y += this.children[0].rotationVelocity.y * duration;
	this.children[0].rotation.z += this.children[0].rotationVelocity.z * duration;

	var move = this.target.clone().sub(this.position);

	if (move.length() < 1) {
		this.randomize();
	}

	move.normalize();

	this.direction.x += (move.x - this.direction.x) * duration;
	this.direction.y += (move.y - this.direction.y) * duration;
	this.direction.z += (move.z - this.direction.z) * duration;
	this.direction.normalize();

	var add = this.direction.clone().setLength(this.velocity * duration);

	this.position.add(add);

	if (this.velocity > 8) {
		this.velocity *= 0.9;
	}
};

$.Bubble.prototype.burst = function() {
	var rnd = Math.random();

	if (rnd < 0.33) {
		$.WORLD.playSound("bubble0", this.position, this.scale.x / 10);
	} else if (rnd < 0.66) {
		$.WORLD.playSound("bubble1", this.position, this.scale.x / 10);
	} else {
		$.WORLD.playSound("bubble2", this.position, this.scale.x / 10);
	}

	this.view.removeObject(this);

	if (this.scale.x > 3) {
		for (var i = 0; i < 10; i += 1) {
			this.view.bubble(this.position, this.scale.x, this.scale.x / 3);
		}
	}
};

$.Bubble.prototype.randomize = function(distance) {
	distance = distance | 20;

	var offset = new THREE.Vector3((Math.random() - 0.5) * 2 * distance, (Math.random() - 0.5) * 2 * distance, (Math.random() - 0.5) * 2 * distance);

	this.target = this.position.clone().add(offset);
};