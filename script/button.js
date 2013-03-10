$.Button = function(image, color) {
	THREE.Object3D.call(this);

	var geometry = this.createGeometry();
	var frontMaterial = Util.createTexturedMaterial(image, 1);
	var sideMaterial = Util.createColoredMaterial(color);
	var mesh = new THREE.Mesh(geometry, new THREE.MeshFaceMaterial([ frontMaterial, sideMaterial ]));

	this.rotation.x = Math.PI / 2;

	this.add(mesh);
}

$.Button.prototype = Object.create(THREE.Object3D.prototype);

$.Button.prototype.createGeometry = function() {
	if ($.Button.uniqueGeometry) {
		return $.Button.uniqueGeometry;
	}

	var shape = Util.createCircleShape(0.5);
	var geometry = new $.ExtrudeGeometry(shape, {
		amount : 0.1,
		bevelSegments : 2,
		steps : 2,
		bevelSize : 0.01,
		bevelThickness : 0.01,
		material : 0,
		extrudeMaterial : 1,
	});

	geometry.computeFaceNormals();
	geometry.computeVertexNormals();
	geometry.computeTangents();
	geometry.computeBoundingBox();
	THREE.GeometryUtils.center(geometry);

	return $.Button.uniqueGeometry = geometry;
}
