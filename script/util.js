THREE.Camera.prototype.computeDistance = function(width, height) {
	var ratio = (width / height) / (window.innerWidth / window.innerHeight);
	return (height * Math.max(1, ratio) / 2) * (1 / Math.tan(Math.PI * $.fov / 360)) * 1.2;
};

THREE.Camera.prototype.locate = function(lookingAt, direction, distance, theta) {
	var dir = direction + this.directionOffset;
	var t = theta + this.thetaOffset;

	var directionX = Math.cos(dir);
	var directionY = Math.sin(dir);

	var vector = new THREE.Vector3(Math.sin(t + Math.PI) * directionX, Math.cos(t + Math.PI) * directionX, directionY).setLength(distance);

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

$.ExtrudeGeometry = function(shapes, options) {
	THREE.ExtrudeGeometry.call(this, shapes, options);
};

$.ExtrudeGeometry.prototype = Object.create(THREE.ExtrudeGeometry.prototype);


var Util = Util || {

};

Util.createRoundedRectangleShape = function(width, height, radius) {
	var shape = new THREE.Shape();
	var hw = width / 2;
	var hh = height / 2;

	shape.moveTo(-hw + radius, hh);
	shape.lineTo(hw - radius, hh);
	shape.quadraticCurveTo(hw, hh, hw, hh - radius);
	shape.lineTo(hw, - hh + radius);
	shape.quadraticCurveTo(hw, - hh, hw - radius, - hh);
	shape.lineTo(-hw + radius, - hh);
	shape.quadraticCurveTo(-hw, - hh, - hw, - hh + radius);
	shape.lineTo(-hw, hh - radius);
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

Util.schedule = function(f, delay) {
	new TWEEN.Tween(0).onComplete(f).delay(delay).start();
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

THREE.ExtrudeGeometry.WorldUVGenerator = {
	generateTopUV: function(geometry, extrudedShape, extrudeOptions, indexA, indexB, indexC) {
		var ax = geometry.vertices[indexA].x,
			ay = geometry.vertices[indexA].y,

			bx = geometry.vertices[indexB].x,
			by = geometry.vertices[indexB].y,

			cx = geometry.vertices[indexC].x,
			cy = geometry.vertices[indexC].y,

			bb = extrudedShape.getBoundingBox(),
			bbx = bb.maxX - bb.minX,
			bby = bb.maxY - bb.minY;

		return [new THREE.Vector2((ax - bb.minX) / bbx, 1 - (ay - bb.minY) / bby),
		new THREE.Vector2((bx - bb.minX) / bbx, 1 - (by - bb.minY) / bby),
		new THREE.Vector2((cx - bb.minX) / bbx, 1 - (cy - bb.minY) / bby)];
	},

	generateBottomUV: function(geometry, extrudedShape, extrudeOptions, indexA, indexB, indexC) {
		return this.generateTopUV(geometry, extrudedShape, extrudeOptions, indexA, indexB, indexC);
	},

	generateSideWallUV: function(geometry, extrudedShape, wallContour, extrudeOptions, indexA, indexB, indexC, indexD,
	stepIndex, stepsLength, contourIndex1, contourIndex2) {
		var ax = geometry.vertices[indexA].x,
			ay = geometry.vertices[indexA].y,
			az = geometry.vertices[indexA].z,

			bx = geometry.vertices[indexB].x,
			by = geometry.vertices[indexB].y,
			bz = geometry.vertices[indexB].z,

			cx = geometry.vertices[indexC].x,
			cy = geometry.vertices[indexC].y,
			cz = geometry.vertices[indexC].z,

			dx = geometry.vertices[indexD].x,
			dy = geometry.vertices[indexD].y,
			dz = geometry.vertices[indexD].z;

		var amt = extrudeOptions.amount,
			bb = extrudedShape.getBoundingBox(),
			bbx = bb.maxX - bb.minX,
			bby = bb.maxY - bb.minY;

		if (Math.abs(ay - by) < 0.01) {
			return [new THREE.Vector2(ax / bbx, az / amt), new THREE.Vector2(bx / bbx, bz / amt),
			new THREE.Vector2(cx / bbx, cz / amt), new THREE.Vector2(dx / bbx, dz / amt)];
		} else {
			return [new THREE.Vector2(ay / bby, az / amt), new THREE.Vector2(by / bby, bz / amt),
			new THREE.Vector2(cy / bby, cz / amt), new THREE.Vector2(dy / bby, dz / amt)];
		}
	}
};

/**
 * Unfortunately, replacing the f3 method is not possible without copying the
 * whole addShape
 */
$.ExtrudeGeometry.prototype.addShape = function(shape, options) {

	var amount = options.amount !== undefined ? options.amount : 100;

	var bevelThickness = options.bevelThickness !== undefined ? options.bevelThickness : 6; // 10
	var bevelSize = options.bevelSize !== undefined ? options.bevelSize : bevelThickness - 2; // 8
	var bevelSegments = options.bevelSegments !== undefined ? options.bevelSegments : 3;

	var bevelEnabled = options.bevelEnabled !== undefined ? options.bevelEnabled : true; // false

	var curveSegments = options.curveSegments !== undefined ? options.curveSegments : 12;

	var steps = options.steps !== undefined ? options.steps : 1;

	var extrudePath = options.extrudePath;
	var extrudePts, extrudeByPath = false;

	var material = options.material;
	var backMaterial = options.backMaterial;
	var extrudeMaterial = options.extrudeMaterial;

	// Use default WorldUVGenerator if no UV generators are specified.
	var uvgen = options.UVGenerator !== undefined ? options.UVGenerator : THREE.ExtrudeGeometry.WorldUVGenerator;

	var shapebb = this.shapebb;
	// shapebb = shape.getBoundingBox();

	var splineTube, binormal, normal, position2;
	if (extrudePath) {

		extrudePts = extrudePath.getSpacedPoints(steps);

		extrudeByPath = true;
		bevelEnabled = false; // bevels not supported for path extrusion

		// SETUP TNB variables

		// Reuse TNB from TubeGeomtry for now.
		// TODO1 - have a .isClosed in spline?

		splineTube = options.frames !== undefined ? options.frames : new THREE.TubeGeometry.FrenetFrames(extrudePath,
		steps, false);

		// console.log(splineTube, 'splineTube', splineTube.normals.length,
		// 'steps', steps, 'extrudePts', extrudePts.length);

		binormal = new THREE.Vector3();
		normal = new THREE.Vector3();
		position2 = new THREE.Vector3();

	}

	// Safeguards if bevels are not enabled

	if (!bevelEnabled) {

		bevelSegments = 0;
		bevelThickness = 0;
		bevelSize = 0;

	}

	// Variables initalization

	var ahole, h, hl; // looping of holes
	var scope = this;
	var bevelPoints = [];

	var shapesOffset = this.vertices.length;

	var shapePoints = shape.extractPoints(curveSegments);

	var vertices = shapePoints.shape;
	var holes = shapePoints.holes;

	var reverse = !THREE.Shape.Utils.isClockWise(vertices);

	if (reverse) {

		vertices = vertices.reverse();

		// Maybe we should also check if holes are in the opposite direction,
		// just to be safe ...

		for (h = 0, hl = holes.length; h < hl; h++) {

			ahole = holes[h];

			if (THREE.Shape.Utils.isClockWise(ahole)) {

				holes[h] = ahole.reverse();

			}

		}

		reverse = false; // If vertices are in order now, we shouldn't need
		// to worry about them again (hopefully)!

	}

	var faces = THREE.Shape.Utils.triangulateShape(vertices, holes);

	/* Vertices */

	var contour = vertices; // vertices has all points but contour has only
	// points of circumference

	for (h = 0, hl = holes.length; h < hl; h++) {

		ahole = holes[h];

		vertices = vertices.concat(ahole);

	}

	function scalePt2(pt, vec, size) {

		if (!vec) console.log("die");

		return vec.clone().multiplyScalar(size).add(pt);

	}

	var b, bs, t, z, vert, vlen = vertices.length,
		face, flen = faces.length,
		cont, clen = contour.length;

	// Find directions for point movement

	var RAD_TO_DEGREES = 180 / Math.PI;

	function getBevelVec(pt_i, pt_j, pt_k) {

		// Algorithm 2

		return getBevelVec2(pt_i, pt_j, pt_k);

	}

	function getBevelVec1(pt_i, pt_j, pt_k) {

		var anglea = Math.atan2(pt_j.y - pt_i.y, pt_j.x - pt_i.x);
		var angleb = Math.atan2(pt_k.y - pt_i.y, pt_k.x - pt_i.x);

		if (anglea > angleb) {

			angleb += Math.PI * 2;

		}

		var anglec = (anglea + angleb) / 2;

		// console.log('angle1', anglea * RAD_TO_DEGREES,'angle2', angleb *
		// RAD_TO_DEGREES, 'anglec', anglec *RAD_TO_DEGREES);

		var x = -Math.cos(anglec);
		var y = -Math.sin(anglec);

		var vec = new THREE.Vector2(x, y); // .normalize();

		return vec;

	}

	function getBevelVec2(pt_i, pt_j, pt_k) {

		var a = THREE.ExtrudeGeometry.__v1,
			b = THREE.ExtrudeGeometry.__v2,
			v_hat = THREE.ExtrudeGeometry.__v3,
			w_hat = THREE.ExtrudeGeometry.__v4,
			p = THREE.ExtrudeGeometry.__v5,
			q = THREE.ExtrudeGeometry.__v6,
			v, w, v_dot_w_hat, q_sub_p_dot_w_hat, s, intersection;

		// good reading for line-line intersection
		// http://sputsoft.com/blog/2010/03/line-line-intersection.html

		// define a as vector j->i
		// define b as vectot k->i

		a.set(pt_i.x - pt_j.x, pt_i.y - pt_j.y);
		b.set(pt_i.x - pt_k.x, pt_i.y - pt_k.y);

		// get unit vectors

		v = a.normalize();
		w = b.normalize();

		// normals from pt i

		v_hat.set(-v.y, v.x);
		w_hat.set(w.y, - w.x);

		// pts from i

		p.copy(pt_i).add(v_hat);
		q.copy(pt_i).add(w_hat);

		if (p.equals(q)) {

			// console.log("Warning: lines are straight");
			return w_hat.clone();

		}

		// Points from j, k. helps prevents points cross overover most of the
		// time

		p.copy(pt_j).add(v_hat);
		q.copy(pt_k).add(w_hat);

		v_dot_w_hat = v.dot(w_hat);
		q_sub_p_dot_w_hat = q.sub(p).dot(w_hat);

		// We should not reach these conditions

		if (v_dot_w_hat === 0) {

			console.log("Either infinite or no solutions!");

			if (q_sub_p_dot_w_hat === 0) {

				console.log("Its finite solutions.");

			} else {

				console.log("Too bad, no solutions.");

			}

		}

		s = q_sub_p_dot_w_hat / v_dot_w_hat;

		if (s < 0) {

			// in case of emergecy, revert to algorithm 1.

			return getBevelVec1(pt_i, pt_j, pt_k);

		}

		intersection = v.multiplyScalar(s).add(p);

		return intersection.sub(pt_i).clone(); // Don't normalize!, otherwise
		// sharp corners become ugly

	}

	var contourMovements = [];

	for (var i = 0, il = contour.length, j = il - 1, k = i + 1; i < il; i++, j++, k++) {

		if (j === il) j = 0;
		if (k === il) k = 0;

		// (j)---(i)---(k)
		// console.log('i,j,k', i, j , k)

		var pt_i = contour[i];
		var pt_j = contour[j];
		var pt_k = contour[k];

		contourMovements[i] = getBevelVec(contour[i], contour[j], contour[k]);

	}

	var holesMovements = [],
		oneHoleMovements, verticesMovements = contourMovements.concat();

	for (h = 0, hl = holes.length; h < hl; h++) {

		ahole = holes[h];

		oneHoleMovements = [];

		for (i = 0, il = ahole.length, j = il - 1, k = i + 1; i < il; i++, j++, k++) {

			if (j === il) j = 0;
			if (k === il) k = 0;

			// (j)---(i)---(k)
			oneHoleMovements[i] = getBevelVec(ahole[i], ahole[j], ahole[k]);

		}

		holesMovements.push(oneHoleMovements);
		verticesMovements = verticesMovements.concat(oneHoleMovements);

	}

	// Loop bevelSegments, 1 for the front, 1 for the back

	for (b = 0; b < bevelSegments; b++) {
		// for ( b = bevelSegments; b > 0; b -- ) {

		t = b / bevelSegments;
		z = bevelThickness * (1 - t);

		// z = bevelThickness * t;
		bs = bevelSize * (Math.sin(t * Math.PI / 2)); // curved
		// bs = bevelSize * t ; // linear

		// contract shape

		for (i = 0, il = contour.length; i < il; i++) {

			vert = scalePt2(contour[i], contourMovements[i], bs);
			// vert = scalePt( contour[ i ], contourCentroid, bs, false );
			v(vert.x, vert.y, - z);

		}

		// expand holes

		for (h = 0, hl = holes.length; h < hl; h++) {

			ahole = holes[h];
			oneHoleMovements = holesMovements[h];

			for (i = 0, il = ahole.length; i < il; i++) {

				vert = scalePt2(ahole[i], oneHoleMovements[i], bs);
				// vert = scalePt( ahole[ i ], holesCentroids[ h ], bs, true );

				v(vert.x, vert.y, - z);

			}

		}

	}

	bs = bevelSize;

	// Back facing vertices

	for (i = 0; i < vlen; i++) {

		vert = bevelEnabled ? scalePt2(vertices[i], verticesMovements[i], bs) : vertices[i];

		if (!extrudeByPath) {

			v(vert.x, vert.y, 0);

		} else {

			// v( vert.x, vert.y + extrudePts[ 0 ].y, extrudePts[ 0 ].x );

			normal.copy(splineTube.normals[0]).multiplyScalar(vert.x);
			binormal.copy(splineTube.binormals[0]).multiplyScalar(vert.y);

			position2.copy(extrudePts[0]).add(normal).add(binormal);

			v(position2.x, position2.y, position2.z);

		}

	}

	// Add stepped vertices...
	// Including front facing vertices

	var s;

	for (s = 1; s <= steps; s++) {

		for (i = 0; i < vlen; i++) {

			vert = bevelEnabled ? scalePt2(vertices[i], verticesMovements[i], bs) : vertices[i];

			if (!extrudeByPath) {

				v(vert.x, vert.y, amount / steps * s);

			} else {

				// v( vert.x, vert.y + extrudePts[ s - 1 ].y, extrudePts[ s - 1
				// ].x );

				normal.copy(splineTube.normals[s]).multiplyScalar(vert.x);
				binormal.copy(splineTube.binormals[s]).multiplyScalar(vert.y);

				position2.copy(extrudePts[s]).add(normal).add(binormal);

				v(position2.x, position2.y, position2.z);

			}

		}

	}

	// Add bevel segments planes

	// for ( b = 1; b <= bevelSegments; b ++ ) {
	for (b = bevelSegments - 1; b >= 0; b--) {

		t = b / bevelSegments;
		z = bevelThickness * (1 - t);
		// bs = bevelSize * ( 1-Math.sin ( ( 1 - t ) * Math.PI/2 ) );
		bs = bevelSize * Math.sin(t * Math.PI / 2);

		// contract shape

		for (i = 0, il = contour.length; i < il; i++) {

			vert = scalePt2(contour[i], contourMovements[i], bs);
			v(vert.x, vert.y, amount + z);

		}

		// expand holes

		for (h = 0, hl = holes.length; h < hl; h++) {

			ahole = holes[h];
			oneHoleMovements = holesMovements[h];

			for (i = 0, il = ahole.length; i < il; i++) {

				vert = scalePt2(ahole[i], oneHoleMovements[i], bs);

				if (!extrudeByPath) {

					v(vert.x, vert.y, amount + z);

				} else {

					v(vert.x, vert.y + extrudePts[steps - 1].y, extrudePts[steps - 1].x + z);

				}

			}

		}

	}

	/* Faces */

	// Top and bottom faces
	buildLidFaces();

	// Sides faces

	buildSideFaces();

	// /// Internal functions

	function buildLidFaces() {

		if (bevelEnabled) {

			var layer = 0; // steps + 1
			var offset = vlen * layer;

			// Bottom faces

			for (i = 0; i < flen; i++) {

				face = faces[i];
				f3(face[2] + offset, face[1] + offset, face[0] + offset, true);

			}

			layer = steps + bevelSegments * 2;
			offset = vlen * layer;

			// Top faces

			for (i = 0; i < flen; i++) {

				face = faces[i];
				f3(face[0] + offset, face[1] + offset, face[2] + offset, false);

			}

		} else {

			// Bottom faces

			for (i = 0; i < flen; i++) {

				face = faces[i];
				f3(face[2], face[1], face[0], true);

			}

			// Top faces

			for (i = 0; i < flen; i++) {

				face = faces[i];
				f3(face[0] + vlen * steps, face[1] + vlen * steps, face[2] + vlen * steps, false);

			}
		}

	}

	// Create faces for the z-sides of the shape

	function buildSideFaces() {

		var layeroffset = 0;
		sidewalls(contour, layeroffset);
		layeroffset += contour.length;

		for (h = 0, hl = holes.length; h < hl; h++) {

			ahole = holes[h];
			sidewalls(ahole, layeroffset);

			// , true
			layeroffset += ahole.length;

		}

	}

	function sidewalls(contour, layeroffset) {

		var j, k;
		i = contour.length;

		while (--i >= 0) {

			j = i;
			k = i - 1;
			if (k < 0) k = contour.length - 1;

			// console.log('b', i,j, i-1, k,vertices.length);

			var s = 0,
				sl = steps + bevelSegments * 2;

			for (s = 0; s < sl; s++) {

				var slen1 = vlen * s;
				var slen2 = vlen * (s + 1);

				var a = layeroffset + j + slen1,
					b = layeroffset + k + slen1,
					c = layeroffset + k + slen2,
					d = layeroffset + j + slen2;

				f4(a, b, c, d, contour, s, sl, j, k);

			}
		}

	}

	function v(x, y, z) {

		scope.vertices.push(new THREE.Vector3(x, y, z));

	}

	function f3(a, b, c, isBottom) {
		a += shapesOffset;
		b += shapesOffset;
		c += shapesOffset;

		// normal, color, material
		scope.faces.push(new THREE.Face3(a, b, c, null, null, (isBottom && backMaterial) ? backMaterial : material));

		var uvs = isBottom ? uvgen.generateBottomUV(scope, shape, options, a, b, c) : uvgen.generateTopUV(scope, shape,
		options, a, b, c);

		scope.faceVertexUvs[0].push(uvs);

	}

	function f4(a, b, c, d, wallContour, stepIndex, stepsLength, contourIndex1, contourIndex2) {

		a += shapesOffset;
		b += shapesOffset;
		c += shapesOffset;
		d += shapesOffset;

		scope.faces.push(new THREE.Face4(a, b, c, d, null, null, extrudeMaterial));

		var uvs = uvgen.generateSideWallUV(scope, shape, wallContour, options, a, b, c, d, stepIndex, stepsLength,
		contourIndex1, contourIndex2);
		scope.faceVertexUvs[0].push(uvs);

	}
};