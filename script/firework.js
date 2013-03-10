var Firework = Firework || {}

$.Firework = function() {
	this.objects = [];
}

$.Firework.prototype.activate = function() {
}

$.Firework.prototype.animate = function(time) {
	if (!this.lastTime) {
		this.lastTime = time;
		return;
	}

	var duration = (time - this.lastTime) / 1000;
	this.lastTime = time;

	for ( var i = 0; i < this.objects.length; i += 1) {
		this.objects[i].animate(time, duration);
	}

}

$.Firework.prototype.bubble = function(position, radius, maxSize) {
	var bubbleObject = new $.Bubble(this.bubbleGeometry, this.bubbleTexture, position, radius, maxSize);

	this.add(bubbleObject);
}

$.Firework.prototype.add = function(object) {
	this.objects.push(object);
	$.scene.add(object);
}

$.Firework.prototype.remove = function(object) {
	this.objects.splice(this.objects.indexOf(object), 1);
	$.scene.remove(object);
}

$.Firework.prototype.load = function() {
	this.bubbleGeometry = new THREE.CircleGeometry(1, 32);
	this.bubbleTexture = Util.createParticleMaterial('asset/bubble.png');
}

$.firework = new $.Firework();

$.Bubble = function(geometry, texture, position, radius, maxSize) {
	maxSize = maxSize || 4;

	THREE.Mesh.call(this, geometry, texture);

	var size = Math.random() * (maxSize / 2) + (maxSize / 2);
	this.direction = new THREE.Vector3(Math.random() - 0.5, Math.random() - 0.5, Math.random() - 0.5).normalize();
	this.position = position.clone().add(this.direction.clone().setLength(radius));
	this.scale.set(size, size, size);
	this.velocity = 80;
	this.lifespan = Math.random() * 3;
	this.randomize(20);
}

$.Bubble.prototype = Object.create(THREE.Mesh.prototype);

$.Bubble.prototype.animate = function(time, duration) {
	this.lifespan -= duration;

	if (this.lifespan < 0) {
		this.burst();
		return;
	}

	this.lookAt($.camera.position);

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
}

$.Bubble.prototype.burst = function() {
	var rnd = Math.random();

	if (rnd < 0.33) {
		$.play("bubble0", this.position, this.scale.x / 10);
	} else if (rnd < 0.66) {
		$.play("bubble1", this.position, this.scale.x / 10);
	} else {
		$.play("bubble2", this.position, this.scale.x / 10);
	}

	$.firework.remove(this);

	if (this.scale.x > 3) {
		for ( var i = 0; i < 10; i += 1) {
			$.firework.bubble(this.position, this.scale.x, this.scale.x / 3);
		}
	}
}

$.Bubble.prototype.randomize = function(distance) {
	distance = distance | 20;

	var offset = new THREE.Vector3((Math.random() - 0.5) * 2 * distance, (Math.random() - 0.5) * 2 * distance, (Math
			.random() - 0.5)
			* 2 * distance);

	this.target = this.position.clone().add(offset);
}
