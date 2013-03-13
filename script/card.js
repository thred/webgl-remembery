$.CARD_SIZE = 8;
$.CARD_THICKNESS = 1;
$.CARD_SPACING = 2;

$.Card = function(frontMaterial, backMaterial, sideMaterial) {
	THREE.Object3D.call(this);

	var geometry = this.createGeometry();
	var mesh = new THREE.Mesh(geometry, new THREE.MeshFaceMaterial([frontMaterial, backMaterial, sideMaterial]));

	mesh.rotation.x = Math.PI;
	mesh.rotation.z = Math.PI;

	this.add(mesh);
};

$.Card.prototype = Object.create(THREE.Object3D.prototype);

$.Card.prototype.createGeometry = function() {
	if ($.Card.uniqueGeometry) {
		return $.Card.uniqueGeometry;
	}

	var shape = Util.createRoundedRectangleShape($.CARD_SIZE, $.CARD_SIZE, $.CARD_SIZE / 8);
	var geometry = new $.ExtrudeGeometry(shape, {
		amount: $.CARD_THICKNESS,
		bevelSegments: 2,
		steps: 2,
		bevelSize: $.CARD_THICKNESS / 100,
		bevelThickness: $.CARD_THICKNESS / 100,
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

	return new TWEEN.Tween(from).to(to, duration).easing(TWEEN.Easing.Elastic.Out).onStart(start).onUpdate(update);
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
			self.position.z = this.z + Math.sin(this.h) * $.CARD_SIZE;
			self.rotation.z = this.r;
		};

	return new TWEEN.Tween(from).to(to, 400 * $.SPEED).onUpdate(update);

};