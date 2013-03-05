var Menu = Menu || {
	buttonSize : 8,
	buttonThickness : 0.8,
	buttonSpacing : 2,

	buttons : [ {
		texture : 'asset/xsmall.png',
		color : 0xcc00ff,
		width : 2,
		height : 1
	}, {
		texture : 'asset/small.png',
		color : 0x4400aa,
		width : 6,
		height : 3
	}, {
		texture : 'asset/medium.png',
		color : 0x2ca05a,
		width : 6,
		height : 4
	}, {
		texture : 'asset/large.png',
		color : 0xd45500,
		width : 6,
		height : 6
	}, {
		texture : 'asset/xlarge.png',
		color : 0x782121,
		width : 8,
		height : 6
	} ]
}

Menu.activate = function() {
	for ( var i = 0; i < 5; i += 1) {
		Menu.buttonFlyIn(i);
	}

	Memory.tweenCameraLocate(new THREE.Vector3(0, 0, 0), new THREE.Vector2(-0.6, 1.2), Math.PI,
			(Menu.buttonSize + Menu.buttonSpacing) * 3, (Menu.buttonSize + Menu.buttonSpacing) * 3, 2000).start();
	// Memory.tweenCameraTo(new THREE.Vector3(0, 0, 0), new THREE.Vector3(0,
	// -0.6, 1.2),
	// (Menu.buttonSize + Menu.buttonSpacing) * 3, (Menu.buttonSize +
	// Menu.buttonSpacing) * 3, 2000).start();
}

Menu.onClick = function(mesh) {
	Memory.removeAllClickables();

	for ( var i = 0; i < 5; i += 1) {
		if (i != mesh.index) {
			Menu.buttonFlyOut(i);
		}
	}

	Game.boardSize = {
		width : Menu.buttons[mesh.index].width,
		height : Menu.buttons[mesh.index].height
	};

	Menu.buttonHappy(mesh.index);

	return true;
}

Menu.buttonFlyIn = function(index) {
	var mesh = Menu.buttons[index].mesh;

	new TWEEN.Tween({
		alpha : index / 5 * Math.PI * 2 + Math.PI * 8,
		dist : 6,
		rot : -Math.PI * 8
	}).to({
		alpha : index / 5 * Math.PI * 2,
		dist : 1,
		rot : 0
	}, 2000 * Memory.SPEED).onStart(function() {
		mesh.visible = true;
	}).onUpdate(function() {
		mesh.position.x = Math.sin(this.alpha) * (Menu.buttonSize + Menu.buttonSpacing) * this.dist;
		mesh.position.y = Math.cos(this.alpha) * (Menu.buttonSize + Menu.buttonSpacing) * this.dist;
		mesh.position.z = Menu.buttonThickness / 2;
		mesh.rotation.z = this.rot;
	}).onComplete(function() {
		Memory.addClickable(mesh, Menu.onClick);
	}).easing(TWEEN.Easing.Sinusoidal.Out).start();
}

Menu.buttonFlyOut = function(index) {
	var mesh = Menu.buttons[index].mesh;
	var alpha = index / 5 * Math.PI * 2;

	new TWEEN.Tween({
		posX : mesh.position.x,
		posY : mesh.position.y,
		posZ : mesh.position.z,
		height : 0,
		rot : 0
	}).to({
		posX : Math.sin(alpha) * (Menu.buttonSize + Menu.buttonSpacing) * 16,
		posY : Math.cos(alpha) * (Menu.buttonSize + Menu.buttonSpacing) * 16,
		posZ : mesh.position.z,
		height : Math.PI / 2,
		rot : Math.PI * 32
	}, 2000 * Memory.SPEED).onUpdate(function() {
		mesh.position.x = this.posX;
		mesh.position.y = this.posY;
		mesh.position.z = this.posZ + Math.abs(Math.sin(this.height)) * Menu.buttonSize * 8;
		mesh.rotation.x = this.rot;
	}).onComplete(function() {
		mesh.visible = false;
	}).easing(TWEEN.Easing.Sinusoidal.In).start();
}

Menu.buttonHappy = function(index) {
	var mesh = Menu.buttons[index].mesh;

	new TWEEN.Tween({
		posX : mesh.position.x,
		posY : mesh.position.y,
		posZ : mesh.position.z,
		fact : 0
	}).to({
		posX : 0,
		posY : 0,
		posZ : mesh.position.z,
		fact : Math.PI * 3
	}, 1500 * Memory.SPEED).onUpdate(function() {
		mesh.position.x = this.posX;
		mesh.position.y = this.posY;
		mesh.position.z = this.posZ + Math.abs(Math.sin(this.fact)) * Menu.buttonSize;
		mesh.rotation.x = this.fact * 6;
		Memory.createSparkle(mesh.position.clone());
	}).chain(new TWEEN.Tween({
		posZ : mesh.position.z,
		fact : 0
	}).to({
		posZ : mesh.position.z,
		fact : Math.PI / 2
	}, 500 * Memory.SPEED).onUpdate(function() {
		mesh.position.z = this.posZ + Math.abs(Math.sin(this.fact)) * Menu.buttonSize * 5;
		mesh.rotation.x = this.fact * 12;
		Memory.createSparkle(mesh.position.clone());
	}).onComplete(function() {
		mesh.visible = false;
		Memory.toState(Memory.STATE_GAME);
	})).start();
}

Menu.load = function() {
	var geometry = Menu.createButtonGeometry();

	for ( var i = 0; i < 5; i += 1) {
		var frontMaterial = Util.createTexturedMaterial(Menu.buttons[i].texture);
		var sideMaterial = Util.createColoredMaterial(Menu.buttons[i].color);
		var mesh = Menu.buttons[i].mesh = Menu.createButtonMesh(geometry, frontMaterial, sideMaterial, i);

		mesh.visible = false;
		mesh.position.set(0, 0, -Menu.buttonThickness);

		Memory.scene.add(mesh);
	}
}

Menu.createButtonGeometry = function() {
	var radius = Menu.buttonSize / 2;
	var shape = new THREE.Shape();

	shape.moveTo(0, radius);
	shape.quadraticCurveTo(radius, radius, radius, 0);
	shape.quadraticCurveTo(radius, -radius, 0, -radius);
	shape.quadraticCurveTo(-radius, -radius, -radius, 0);
	shape.quadraticCurveTo(-radius, radius, 0, radius);

	return new THREE.ExtrudeGeometry(shape, {
		amount : Menu.buttonThickness,
		bevelSegments : 2,
		steps : 2,
		bevelSize : Menu.buttonThickness,
		bevelThickness : Menu.buttonThickness,
		material : 0,
		extrudeMaterial : 1,
		UVGenerator : Util.UVGenerator
	});
}

Menu.createButtonMesh = function(geometry, frontMaterial, sideMaterial, index) {
	var mesh = new THREE.Mesh(geometry, new THREE.MeshFaceMaterial([ frontMaterial, sideMaterial ]));

	mesh.index = index;

	return mesh;
}
