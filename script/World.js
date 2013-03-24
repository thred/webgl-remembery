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

$.World = function() {
	function initAmbientLight(scene) {
		var ambientLight = new THREE.AmbientLight(0x222222);

		scene.add(ambientLight);

		return ambientLight;
	}

	function initDirectionalLight(scene) {
		var directionalLightA = new THREE.DirectionalLight(0xfffff0, 0.5);
		directionalLightA.position.set(0.5, - 1, 1).normalize();
		scene.add(directionalLightA);

		var directionalLightB = new THREE.DirectionalLight(0xfffff0, 1.0);
		directionalLightB.position.set(-0.5, - 1, 1).normalize();
		scene.add(directionalLightB);

		return [directionalLightA, directionalLightB];
	}

	function initCamera(scene, windowSize, fov) {
		var camera = new THREE.PerspectiveCamera(fov, windowSize.width / windowSize.height, 1, 1000);

		camera.position.set(0, 0, 0);
		camera.up.set(0, 0, 1);
		camera.directionOffset = 0;
		camera.thetaOffset = 0;

		scene.add(camera);

		camera.locate(new THREE.Vector3(0, 0, 0), 0, 100, 0);

		return camera;
	}

	function initRenderer(windowSize) {
		if (Detector.webgl) {
			var renderer = new THREE.WebGLRenderer({
				antialias: true,
				preserveDrawingBuffer: true
			});

			renderer.setSize(windowSize.width, windowSize.height);
			document.body.appendChild(renderer.domElement);

			return renderer;
		}

		Detector.addGetWebGLMessage();
	}

	this.views = [];
	this.clickableMeshes = [];
	this.clickBlock = 0;

	this.fov = 50;
	this.windowSize = {
		width: window.innerWidth,
		height: window.innerHeight
	};
	this.mouse = {
		x: 0,
		y: 0
	};

	this.scene = new THREE.Scene();

	this.ambientLight = initAmbientLight(this.scene);
	this.directionalLight = initDirectionalLight(this.scene);
	this.camera = initCamera(this.scene, this.windowSize, this.fov);
	this.renderer = initRenderer(this.windowSize);
	this.projector = new THREE.Projector();
};

$.World.prototype.animate = function(time, duration) {
	for (var i = 0; i < this.views.length; i += 1) {
		this.views[i].animate(time, duration);
	}

	this.renderer.render(this.scene, this.camera);
};

$.World.prototype.addSound = function(id, asset, loadingMonitor) {
	loadingMonitor.add(createjs.Sound);

	createjs.Sound.registerSound(asset, id);
};

$.World.prototype.playSound = function(id, position, volume) {
	position = position || this.camera.position;
	volume = volume || 1;

	var distance = position.distanceTo(this.camera.position);

	if (distance > 100) {
		return;
	}

	createjs.Sound.play(id, "none", 0, 0, 0, Math.min((1 - distance / 100) * volume, 1));
};

$.World.prototype.addObject = function(object) {
	this.scene.add(object);
};

$.World.prototype.removeObject = function(object) {
	this.scene.remove(object);
};

$.World.prototype.addView = function(view) {
	this.views.push(view);
	view.activate();
};

$.World.prototype.removeView = function(view, delay) {
	delay = delay || 0;
	view.inactivate();

	$.MAIN.schedule(this, function() {
		this.views.splice(this.views.indexOf(view), 1);
	}, delay);
};

$.World.prototype.addClickable = function(mesh, object, handler) {
	mesh.onClickObject = object;
	mesh.onClickHandler = handler;
	this.clickableMeshes.push(mesh);
};

$.World.prototype.removeClickable = function(mesh) {
	mesh.onClickObject = null;
	mesh.onClickHandler = null;
	this.clickableMeshes.splice(this.clickableMeshes.indexOf(mesh), 1);
};

$.World.prototype.removeAllClickables = function() {
	while (this.clickableMeshes.length > 0) {
		this.removeClickable(this.clickableMeshes[0]);
	}
};

$.World.prototype.setClick = function(object, handler) {
	this.clickObject = object;
	this.clickHandler = handler;
};

$.World.prototype.clearClick = function() {
	this.clickObject = null;
	this.clickHandler = null;
};

$.World.prototype.addClickBlock = function() {
	this.clickBlock += 1;
};

$.World.prototype.removeClickBlock = function() {
	if (this.clickBlock > 0) {
		this.clickBlock -= 1;
	}
};

$.World.prototype.onDocumentMouseDown = function(event) {
	event.preventDefault();

	if (this.clickBlock > 0) {
		return;
	}

	if (this.clickHandler) {
		if (this.clickHandler.call(this.clickObject)) {
			return;
		}
	}

	var vector = new THREE.Vector3((event.clientX / this.windowSize.width) * 2 - 1, - (event.clientY / this.windowSize.height) * 2 + 1, 0.5);

	this.projector.unprojectVector(vector, this.camera);

	var raycaster = new THREE.Raycaster(this.camera.position, vector.sub(this.camera.position).normalize());
	var intersects = raycaster.intersectObjects(this.clickableMeshes);
	for (var i = 0; i < intersects.length; i += 1) {
		var mesh = intersects[i].object;

		if (mesh.onClickHandler.call(mesh.onClickObject, mesh)) {
			return;
		}
	}
};

$.World.prototype.onDocumentMouseMove = function(event) {
	this.mouse = {
		x: (event.clientX - this.windowSize.width / 2) / (this.windowSize.width / 2),
		y: (event.clientY - this.windowSize.height / 2) / (this.windowSize.height / 2)
	};

	if ((this.camera) && ($.HI)) {
		this.camera.locateOffset(-this.mouse.y * 0.1, this.mouse.x * 0.1);
		//this.camera.locateOffset(-this.mouse.y * 2, this.mouse.x * 2);
	}
};

$.World.prototype.onWindowResize = function() {
	this.windowSize = {
		width: window.innerWidth,
		height: window.innerHeight
	};

	this.camera.aspect = this.windowSize.width / this.windowSize.height;
	this.camera.updateProjectionMatrix();

	this.renderer.setSize(this.windowSize.width, this.windowSize.height);
};