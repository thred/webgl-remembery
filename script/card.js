$.CARD_SIZE = 8;
$.CARD_THICKNESS = 1;
$.CARD_SPACING = 2;

$.Card = function(frontMaterial, backMaterial, sideMaterial) {
	THREE.Object3D.call(this);

	var geometry = this.createGeometry();
	var mesh = new THREE.Mesh(geometry, new THREE.MeshFaceMaterial([ frontMaterial, backMaterial, sideMaterial ]));

//	mesh.rotation.x = Math.PI;
	mesh.rotation.z = Math.PI;
	
	this.add(mesh);
}

$.Card.prototype = Object.create(THREE.Object3D.prototype);

$.Card.prototype.createGeometry = function() {
	if ($.Card.uniqueGeometry) {
		return $.Card.uniqueGeometry;
	}

	var shape = Util.createRoundedRectangleShape($.CARD_SIZE, $.CARD_SIZE, $.CARD_SIZE / 8);
	var geometry = new $.ExtrudeGeometry(shape, {
		amount : $.CARD_THICKNESS,
		bevelSegments : 2,
		steps : 2,
		bevelSize : $.CARD_THICKNESS / 100,
		bevelThickness : $.CARD_THICKNESS / 100,
		material : 0,
		backMaterial : 1,
		extrudeMaterial : 2
	});

	geometry.computeFaceNormals();
	geometry.computeVertexNormals();
	geometry.computeTangents();
	geometry.computeBoundingBox();
	THREE.GeometryUtils.center(geometry);

	return $.Card.uniqueGeometry = geometry;
}
