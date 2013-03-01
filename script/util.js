var Util = Util || {

}

Util.shuffle = function(array) {
	for ( var i = 0; i < array.length; i += 1) {
		var j = parseInt(Math.random() * array.length);
		var tmp = array[j];
		array[j] = array[i];
		array[i] = tmp;
	}
}

Util.schedule = function(f, delay) {
	new TWEEN.Tween(0).onComplete(f).delay(delay).start();
}

Util.round = function(value, offset, to) {
	return Math.round((value - offset) / to) * to + offset;
}

Util.rotateAroundWorldAxis = function(object, axis, radians) {
	var rotationMatrix = new THREE.Matrix4();

	rotationMatrix.makeRotationAxis(axis.normalize(), radians);
	rotationMatrix.multiply(object.matrix); // pre-multiply
	object.matrix = rotationMatrix;
	object.rotation.setEulerFromRotationMatrix(object.matrix);
}

Util.createParticleMaterial = function(texture) {
	var texture = THREE.ImageUtils.loadTexture(texture);
	var material = new THREE.ParticleBasicMaterial({
		size : 128,
		sizeAttenuation : true,
		map : texture,
		blending : THREE.AdditiveBlending,
		transparent : true

	});

	return material;
}

Util.createTexturedMaterial = function(texture, textureRepeat) {
	var texture = THREE.ImageUtils.loadTexture(texture);

	texture.minFilter = texture.magFilter = THREE.LinearFilter;

	var material = new THREE.MeshPhongMaterial({
		map : texture
	});

	material.wrapS = texture.wrapT = THREE.RepeatWrapping;
	// material.repeat.set(textureRepeat, textureRepeat);

	return material;
}

Util.createColoredMaterial = function(materialColor) {
	return new THREE.MeshPhongMaterial({
		color : materialColor
	});
}

Util.UVGenerator = {
	generateTopUV : function(geometry, extrudedShape, extrudeOptions, indexA, indexB, indexC) {
		var ax = geometry.vertices[indexA].x, ay = geometry.vertices[indexA].y,

		bx = geometry.vertices[indexB].x, by = geometry.vertices[indexB].y,

		cx = geometry.vertices[indexC].x, cy = geometry.vertices[indexC].y,

		bb = extrudedShape.getBoundingBox(), bbx = bb.maxX - bb.minX, bby = bb.maxY - bb.minY;

		return [ new THREE.Vector2((ax - bb.minX) / bbx, 1 - (ay - bb.minY) / bby),
				new THREE.Vector2((bx - bb.minX) / bbx, 1 - (by - bb.minY) / bby),
				new THREE.Vector2((cx - bb.minX) / bbx, 1 - (cy - bb.minY) / bby) ];
	},

	generateBottomUV : function(geometry, extrudedShape, extrudeOptions, indexA, indexB, indexC) {
		return this.generateTopUV(geometry, extrudedShape, extrudeOptions, indexA, indexB, indexC);
	},

	generateSideWallUV : function(geometry, extrudedShape, wallContour, extrudeOptions, indexA, indexB, indexC, indexD,
			stepIndex, stepsLength, contourIndex1, contourIndex2) {
		var ax = geometry.vertices[indexA].x, ay = geometry.vertices[indexA].y, az = geometry.vertices[indexA].z,

		bx = geometry.vertices[indexB].x, by = geometry.vertices[indexB].y, bz = geometry.vertices[indexB].z,

		cx = geometry.vertices[indexC].x, cy = geometry.vertices[indexC].y, cz = geometry.vertices[indexC].z,

		dx = geometry.vertices[indexD].x, dy = geometry.vertices[indexD].y, dz = geometry.vertices[indexD].z;

		var amt = extrudeOptions.amount, bb = extrudedShape.getBoundingBox(), bbx = bb.maxX - bb.minX, bby = bb.maxY
				- bb.minY;

		if (Math.abs(ay - by) < 0.01) {
			return [ new THREE.Vector2(ax / bbx, az / amt), new THREE.Vector2(bx / bbx, bz / amt),
					new THREE.Vector2(cx / bbx, cz / amt), new THREE.Vector2(dx / bbx, dz / amt) ];
		} else {
			return [ new THREE.Vector2(ay / bby, az / amt), new THREE.Vector2(by / bby, bz / amt),
					new THREE.Vector2(cy / bby, cz / amt), new THREE.Vector2(dy / bby, dz / amt) ];
		}
	}
}
