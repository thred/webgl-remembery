THREE.Camera.prototype.computeDistance = function(width, height) {
	var ratio = (width / height) / ($.WORLD.windowSize.width / $.WORLD.windowSize.height);
	return (height * Math.max(1, ratio) / 2) * (1 / Math.tan(Math.PI * this.fov / 360)) * 1.2;
};

THREE.Camera.prototype.locate = function(lookingAt, direction, distance, theta) {
	while (theta >= Math.PI * 2) {
		theta -= Math.PI * 2;
	}

	while (theta < 0) {
		theta += Math.PI * 2;
	}

	var dir = direction + this.directionOffset;
	var t = theta + this.thetaOffset;

	var directionX = Math.cos(dir);
	var directionY = Math.sin(dir);

	var vector = new THREE.Vector3(-Math.sin(t + Math.PI) * directionX, Math.cos(t + Math.PI) * directionX, directionY).setLength(distance);

	this.position.set(lookingAt.x + vector.x, lookingAt.y + vector.y, lookingAt.z + vector.z);
	this.lookAt(lookingAt);

	this.lookingAt = lookingAt;
	this.direction = direction;
	this.distance = distance;
	this.theta = theta;
};

THREE.Camera.prototype.locateOffset = function(directionOffset, thetaOffset) {
	this.directionOffset = directionOffset;
	this.thetaOffset = thetaOffset;
	this.locate(this.lookingAt, this.direction, this.distance, this.theta);
};

THREE.Object3D.prototype.setVisible = function(visible) {
	this.visible = visible;

	for (var i = 0; i < this.children.length; i += 1) {
		this.children[i].setVisible(visible);
	}
};

THREE.Object3D.prototype.computeBoundingBox = function() {
	if (this.geometry) {
		this.boundingBox = this.geometry.computeBoundingBox();
	}

	for (var i = 0; i < this.children.length; i += 1) {
		if (this.children[i].computeBoundingBox) {
			var boundingBox = this.children[i].computeBoudingBox();

			this.boundingBox.min.x = Math.min(this.boundingBox.min.x, boundingBox.min.x);
			this.boundingBox.min.y = Math.min(this.boundingBox.min.y, boundingBox.min.y);
			this.boundingBox.min.z = Math.min(this.boundingBox.min.z, boundingBox.min.z);
			this.boundingBox.max.x = Math.max(this.boundingBox.max.x, boundingBox.max.x);
			this.boundingBox.max.y = Math.max(this.boundingBox.max.y, boundingBox.max.y);
			this.boundingBox.max.z = Math.max(this.boundingBox.max.z, boundingBox.max.z);
		}
	}

	return this.boundingBox;
};

var Util = Util || {

};

Util.createRoundedRectangleShape = function(width, height, radius) {
	var shape = new THREE.Shape();
	var hw = width / 2;
	var hh = height / 2;

	shape.moveTo(-hw + radius, hh);

	if (radius * 2 < width) {
		shape.lineTo(hw - radius, hh);
	}

	shape.quadraticCurveTo(hw, hh, hw, hh - radius);

	if (radius * 2 < height) {
		shape.lineTo(hw, - hh + radius);
	}

	shape.quadraticCurveTo(hw, - hh, hw - radius, - hh);

	if (radius * 2 < width) {
		shape.lineTo(-hw + radius, - hh);
	}

	shape.quadraticCurveTo(-hw, - hh, - hw, - hh + radius);

	if (radius * 2 < height) {
		shape.lineTo(-hw, hh - radius);
	}

	shape.quadraticCurveTo(-hw, hh, - hw + radius, hh);

	return shape;
};

Util.createCircleShape = function(radius) {
	var shape = new THREE.Shape();

	shape.moveTo(0, radius);
	shape.quadraticCurveTo(radius, radius, radius, 0);
	shape.quadraticCurveTo(radius, - radius, 0, - radius);
	shape.quadraticCurveTo(-radius, - radius, - radius, 0);
	shape.quadraticCurveTo(-radius, radius, 0, radius);

	return shape;
};

Util.shuffle = function(array) {
	for (var i = 0; i < array.length; i += 1) {
		var j = parseInt(Math.random() * array.length, 10);
		var tmp = array[j];
		array[j] = array[i];
		array[i] = tmp;
	}
};

Util.schedule = function(object, func, delay) {
	new TWEEN.Tween(0).onComplete(function() {
		func.call(object);
	}).delay(delay / $.SPEED).start();
};

Util.round = function(value, offset, to) {
	return Math.round((value - offset) / to) * to + offset;
};

Util.rotateAroundWorldAxis = function(object, axis, radians) {
	var rotationMatrix = new THREE.Matrix4();

	rotationMatrix.makeRotationAxis(axis.normalize(), radians);
	rotationMatrix.multiply(object.matrix); // pre-multiply
	object.matrix = rotationMatrix;
	object.rotation.setEulerFromRotationMatrix(object.matrix);
};

Util.createParticleMaterial = function(textureFile) {
	var texture = THREE.ImageUtils.loadTexture(textureFile);
	var material = new THREE.MeshBasicMaterial({
		map: texture,
		blending: THREE.AdditiveBlending,
		transparent: true
	});

	return material;
};

Util.createTexturedMaterial = function(textureFile, textureRepeat, transparent, opacity) {
	textureRepeat = textureRepeat || 1;
	transparent = transparent || false;
	opacity = opacity || 1;

	var texture = THREE.ImageUtils.loadTexture(textureFile);

	texture.minFilter = texture.magFilter = THREE.LinearFilter;
	texture.wrapS = texture.wrapT = THREE.RepeatWrapping;
	texture.repeat.set(textureRepeat, textureRepeat);

	var material = new THREE.MeshPhongMaterial({
		map: texture,
		specular: 0xffffff,
		ambient: 0xaaccff
	});

	if (transparent) {
		material.transparent = true;
		material.opacity = opacity;
	}

	return material;
};

Util.createColoredMaterial = function(materialColor) {
	return new THREE.MeshPhongMaterial({
		color: materialColor,
		specular: 0xffffff,
		ambient: 0xaaccff

	});
};