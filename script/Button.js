/**
 * Copyright 2013 Manfred Hantschel
 * 
 * This file is part of WebGL-Remembery.
 * 
 * WebGL-Remembery is free software: you can redistribute it and/or modify
 * it under the terms of the GNU General Public License as published by
 * the Free Software Foundation, either version 3 of the License, or
 * (at your option) any later version.
 * 
 * WebGL-Remembery is distributed in the hope that it will be useful,
 * but WITHOUT ANY WARRANTY; without even the implied warranty of
 * MERCHANTABILITY or FITNESS FOR A PARTICULAR PURPOSE. See the
 * GNU General Public License for more details.
 * 
 * You should have received a copy of the GNU General Public License
 * along with WebGL-Remembery. If not, see <http://www.gnu.org/licenses/>.
 */

$.Button = function(image, loadingMonitor, color) {
	THREE.Object3D.call(this);

	var geometry = this.createGeometry();
	var frontMaterial = Util.createTexturedMaterial(image, loadingMonitor, 1);
	var sideMaterial = Util.createColoredMaterial(color);
	var mesh = new THREE.Mesh(geometry, new THREE.MeshFaceMaterial([frontMaterial, sideMaterial]));

	this.rotation.x = Math.PI / 2;

	this.add(mesh);
};

$.Button.prototype = Object.create(THREE.Object3D.prototype);

$.Button.prototype.createGeometry = function() {
	if ($.Button.uniqueGeometry) {
		return $.Button.uniqueGeometry;
	}

	var shape = Util.createCircleShape(0.5);
	var geometry = new $.ExtrudeGeometry(shape, {
		amount: 0.1,
		bevelSegments: ($.HI) ? 2 : 0,
		steps: ($.HI) ? 2 : 1,
		bevelSize: ($.HI) ? 0.01 : 0,
		bevelThickness: ($.HI) ? 0.01 : 0,
		material: 0,
		backMaterial: 1,
		extrudeMaterial: 1
	});

	if ($.HI) {
		geometry.computeFaceNormals();
		geometry.computeVertexNormals();
		geometry.computeTangents();
	}
	
	geometry.computeBoundingBox();
	THREE.GeometryUtils.center(geometry);

	return $.Button.uniqueGeometry = geometry;
};