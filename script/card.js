$.Card = function(frontMaterial, backMaterial, sideMaterial) {
	THREE.Object3D.call(this);

	var geometry = this.createGeometry();
	var mesh = new THREE.Mesh(geometry, new THREE.MeshFaceMaterial([frontMaterial, backMaterial, sideMaterial]));

	mesh.rotation.x = Math.PI;
	//mesh.rotation.z = Math.PI;

	this.add(mesh);
};

$.Card.prototype = Object.create(THREE.Object3D.prototype);

$.Card.SIZE = 8;

$.Card.THICKNESS = 0.5;

$.Card.SPACING = 2;

$.Card.prototype.createGeometry = function() {
	if ($.Card.uniqueGeometry) {
		return $.Card.uniqueGeometry;
	}

	var shape = Util.createRoundedRectangleShape($.Card.SIZE, $.Card.SIZE, $.Card.SIZE / 8);
	var geometry = new $.ExtrudeGeometry(shape, {
		amount: $.Card.THICKNESS,
		bevelSegments: 2,
		steps: 2,
		bevelSize: $.Card.THICKNESS / 100,
		bevelThickness: $.Card.THICKNESS / 100,
		material: 0,
		backMaterial: 1,
		extrudeMaterial: 2
	});

	geometry.computeFaceNormals();
	geometry.computeVertexNormals();
	geometry.computeTangents();
	geometry.computeBoundingBox();
	THREE.GeometryUtils.center(geometry);

	return $.Card.uniqueGeometry = geometry;
};

$.Card.prototype.growTween = function(duration) {
	var self = this;

	var from = {
		scale: 0
	};
	var to = {
		scale: 1
	};
	var start = function() {
			self.setVisible(true);
		};
	var update = function() {
			self.scale.set(this.scale, this.scale, this.scale);
		};

	return new TWEEN.Tween(from).to(to, duration / $.SPEED).easing(TWEEN.Easing.Elastic.Out).onStart(start).onUpdate(update);
};

$.Card.prototype.flyInTween = function(position) {
	var self = this;

	var from = {
		x: this.position.x,
		y: this.position.y,
		z: this.position.z,
		r: this.rotation.z,
		h: 0
	};
	var to = {
		x: position.x,
		y: position.y,
		z: position.z,
		r: this.rotation.z + 2 * Math.PI,
		h: Math.PI
	};
	var update = function() {
			self.position.x = this.x;
			self.position.y = this.y;
			self.position.z = this.z + Math.sin(this.h) * $.Card.SIZE;
			self.rotation.z = this.r;
		};

	return new TWEEN.Tween(from).to(to, 400 / $.SPEED).onUpdate(update);
};


$.Card.prototype.showTween = function() {
	var self = this;

	var from = {
		rot: self.children[0].rotation.y,
		height: 0
	};
	var to = {
		rot: Util.round(self.children[0].rotation.y - Math.PI, Math.PI, Math.PI * 2),
		height: Math.PI
	};
	var update = function() {
			self.children[0].position.z = ($.Card.THICKNESS / 2) + Math.sin(this.height) * $.Card.SIZE;
			self.children[0].rotation.y = this.rot;
		};

	return new TWEEN.Tween(from).to(to, 250 / $.SPEED).onUpdate(update);
};

$.Card.prototype.hideTween = function() {
	var self = this;

	var from = {
		rot: self.children[0].rotation.y,
		height: 0
	};
	var to = {
		rot: Util.round(self.children[0].rotation.y - Math.PI, 0, Math.PI * 2),
		height: Math.PI
	};
	var update = function() {
			self.children[0].position.z = ($.Card.THICKNESS / 2) + Math.sin(this.height) * $.Card.SIZE;
			self.children[0].rotation.y = this.rot;
		};

	return new TWEEN.Tween(from).to(to, 250 / $.SPEED).onUpdate(update);
};

$.Card.prototype.collectTween = function(position) {
	var self = this;

	var from = {
		posX: self.position.x,
		posY: self.position.y,
		posZ: self.position.z,
		rot: self.rotation.z
	};
	var to = {
		posX: position.x,
		posY: position.y,
		posZ: position.z,
		rot: Util.round(self.rotation.z + 4 * Math.PI, 0, Math.PI * 2)
	};
	var start = function() {
			$.WORLD.addClickBlock();
		};
	var update = function() {
			self.position.set(this.posX, this.posY, this.posZ);
			self.rotation.z = this.rot;
		};
	var complete = function() {
			$.WORLD.removeClickBlock();
		};

	return new TWEEN.Tween(from).to(to, 500 / $.SPEED).easing(TWEEN.Easing.Cubic.Out).onStart(start).onUpdate(update).onComplete(complete);
};

$.Card.prototype.stackTween = function(position) {
	var self = this;

	var from = {
		posX: self.position.x,
		posY: self.position.y,
		posZ: self.position.z,
		rot: self.rotation.z,
		height: 0
	};
	var to = {
		posX: position.x,
		posY: position.y,
		posZ: position.z,
		rot: Util.round(self.rotation.z + 4 * Math.PI, 0, Math.PI * 2) + (Math.random() - 0.5) * Math.PI / 8,
		height: Math.PI
	};
	var update = function() {
			self.position.set(this.posX, this.posY, this.posZ + Math.sin(this.height) * $.Card.SIZE);
			self.rotation.z = this.rot;
		};

	return new TWEEN.Tween(from).to(to, 500 / $.SPEED).easing(TWEEN.Easing.Cubic.Out).onUpdate(update);
};

/*
$.Card.prototype.showTween = function() {
	var self = this;

	var from = {
		rot: self.children[0].rotation.x,
		height: 0
	};
	var to = {
		rot: Util.round(self.children[0].rotation.x - Math.PI, 0, Math.PI * 2),
		height: Math.PI
	};
	var update = function() {
			self.children[0].position.z = ($.Card.THICKNESS / 2) + Math.sin(this.height) * $.Card.SIZE;
			self.children[0].rotation.x = this.rot;
		};

	return new TWEEN.Tween(from).to(to, 200 / $.SPEED).onUpdate(update);
};

$.Card.prototype.hideTween = function() {
	var self = this;

	var from = {
		rot: self.children[0].rotation.x,
		height: 0
	};
	var to = {
		rot: Util.round(self.children[0].rotation.x - Math.PI, Math.PI, Math.PI * 2),
		height: Math.PI
	};
	var update = function() {
			self.children[0].position.z = ($.Card.THICKNESS / 2) + Math.sin(this.height) * $.Card.SIZE;
			self.children[0].rotation.x = this.rot;
		};

	return new TWEEN.Tween(from).to(to, 200 / $.SPEED).onUpdate(update);
};
*/