var Memory = Memory || {
	SPEED : 1,

	STATE_NONE : 0,
	STATE_LOAD : 1,
	STATE_MENU : 2,
	STATE_GAME : 3,

	state : 0,
	nextState : 0,

	fov : 50,

	clickableMeshes : [],

	projector : new THREE.Projector()

};

// var fov = 50;
// const
// boardWidth = 8;
// const
// boardHeight = 5;
//
// const
// cardSize = 8;
// const
// cardHeight = 0.4;
// const
// cardSpacing = 2;
// const
// totalWidth = boardWidth * (cardSize + cardSpacing);
// const
// totalHeight = boardHeight * (cardSize + cardSpacing);
//
// var container;
// var projector;
// var renderer;
//
// var cardTopMaterials = [];
// var cardSideMaterial;
// var cardBottomMaterial;
// var cardGeometry;
// var cardMeshes = [];
//
// var cardDatas = [];
// var state = 0;
// var selectedIndices = [];
// var stack = 0;
//
// var mouseX = 0;
// var mouseY = 0;
// var windowWidth = 0;
// var windowHeight = 0;

Memory.init = function() {
	Memory.windowSize = {
		width : window.innerWidth,
		height : window.innerHeight
	}

	Memory.scene = new THREE.Scene();

	Memory.initLight();
	Memory.initCamera();
	Memory.initRenderer();

	document.addEventListener('mousedown', Memory.onDocumentMouseDown, false);
	document.addEventListener('mousemove', Memory.onDocumentMouseMove, false);
	window.addEventListener('resize', Memory.onWindowResize, false);

	//
	// // Memory.moveCamera();
	//
	// initCardDatas();
	//
	// // initCamera();
	// initTable();
	//
	// projector = new THREE.Projector();
	//
	// initRenderer();
	//
	// initScene();
	//
	// document.addEventListener('mousedown', onDocumentMouseDown, false);
	// document.addEventListener('mousemove', onDocumentMouseMove, false);
	// window.addEventListener('resize', onWindowResize, false);

	Memory.toState(Memory.STATE_LOAD);
}

Memory.initLight = function() {
	Memory.scene.add(new THREE.AmbientLight(0x222222));

	var light = new THREE.DirectionalLight(0xfffff0, 0.5);
	light.position.set(0.5, -1, 1).normalize();
	Memory.scene.add(light);

	light = new THREE.DirectionalLight(0xfffff0, 1.0);
	light.position.set(-0.5, -1, 1).normalize();
	Memory.scene.add(light);
}

Memory.initCamera = function() {
	var camera = new THREE.PerspectiveCamera(Memory.fov, window.innerWidth / window.innerHeight, 1, 1000);

	camera.position.set(0, 0, 10);

	camera.lookingAt = new THREE.Vector3(0, 0, 0);
	camera.lookAt(camera.lookingAt);

	Memory.scene.add(Memory.camera = camera);
}

Memory.moveCamera = function() {
	// var width = totalWidth;
	// var height = totalHeight;
	//	
	// var ratio = (width / height) / (window.innerWidth / window.innerHeight);
	//	
	// var dist = (height * Math.max(1, ratio) / 2)
	// * (1 / Math.tan(Math.PI * fov / 360)) * 1.2;
	//	
	// var v = new THREE.Vector3(0, -0.6, 1.2).normalize();
	//
	// var from = {
	// positionX : Memory.camera.position.x,
	// positionY : Memory.camera.position.y,
	// positionZ : Memory.camera.position.z,
	// }
	//	
	// var to = {
	// positionX : v.x * dist,
	// positionY : v.y * dist,
	// positionZ : v.z * dist
	// }
	//
	// var tween = new TWEEN.Tween(from).to(to, boardWidth * boardHeight *
	// 100).onUpdate(function() {
	// Memory.camera.position.x = from.positionX;
	// Memory.camera.position.y = from.positionY;
	// Memory.camera.position.z = from.positionZ;
	// Memory.camera.lookAt(new THREE.Vector3(0, -height / 16, 0));
	// });
	//	
	// tween.start();

	Memory.tweenCameraTo(new THREE.Vector3(0, -0.6, 1.2), new THREE.Vector3(0, 0, 0), totalWidth, totalHeight,
			boardWidth * boardHeight * 100).start();
}

Memory.tweenCameraTo = function(viewVector, lookAtVector, width, height, duration) {
	var ratio = (width / height) / (window.innerWidth / window.innerHeight);

	var dist = (height * Math.max(1, ratio) / 2) * (1 / Math.tan(Math.PI * Memory.fov / 360)) * 1.2;

	viewVector = viewVector.setLength(dist);

	return new TWEEN.Tween({
		posX : Memory.camera.position.x,
		posY : Memory.camera.position.y,
		posZ : Memory.camera.position.z,
		viewX : Memory.camera.lookingAt.x,
		viewY : Memory.camera.lookingAt.y,
		viewZ : Memory.camera.lookingAt.z
	}).to({
		posX : viewVector.x,
		posY : viewVector.y,
		posZ : viewVector.z,
		viewX : lookAtVector.x,
		viewY : lookAtVector.y,
		viewZ : lookAtVector.z
	}, duration * Memory.SPEED).onUpdate(function() {
		Memory.camera.position.x = this.posX;
		Memory.camera.position.y = this.posY;
		Memory.camera.position.z = this.posZ;
		Memory.camera.lookingAt = new THREE.Vector3(this.viewX, this.viewY, this.viewZ);
		Memory.camera.lookAt(Memory.camera.lookingAt);
	}).easing(TWEEN.Easing.Cubic.InOut);
}

Memory.initRenderer = function() {
	if (Detector.webgl) {
		var renderer = Memory.renderer = new THREE.WebGLRenderer({
			antialias : true,
			preserveDrawingBuffer : true
		});

		renderer.setSize(window.innerWidth, window.innerHeight);
		document.body.appendChild(renderer.domElement);
	} else {
		Detector.addGetWebGLMessage();
	}
}

Memory.addClickable = function(mesh, handler) {
	mesh.onClick = handler;
	Memory.clickableMeshes.push(mesh);
}

Memory.removeClickable = function(mesh) {
	Memory.clickableMeshes.splice(Memory.clickableMeshes.indexOf(mesh), 1);
	mesh.onClick = null;
}

Memory.setClick = function(handler) {
	Memory.click = handler;
}

Memory.onDocumentMouseDown = function(event) {
	event.preventDefault();

	if (Memory.click) {
		if (Memory.click()) {
			return;
		}
	}

	var vector = new THREE.Vector3((event.clientX / window.innerWidth) * 2 - 1,
			-(event.clientY / window.innerHeight) * 2 + 1, 0.5);
	Memory.projector.unprojectVector(vector, Memory.camera);

	var raycaster = new THREE.Raycaster(Memory.camera.position, vector.sub(Memory.camera.position).normalize());
	var intersects = raycaster.intersectObjects(Memory.clickableMeshes);

	for ( var i = 0; i < intersects.length; i += 1) {
		var mesh = intersects[i].object;

		if (mesh.onClick(mesh)) {
			return;
		}
	}
}

Memory.onDocumentMouseMove = function(event) {
	Memory.mouse = {
		x : (event.clientX - Memory.windowSize.width / 2) / (Memory.windowSize.width / 2),
		y : (event.clientY - Memory.windowSize.height / 2) / (Memory.windowSize.height / 2)
	}
}

Memory.onWindowResize = function() {
	Memory.windowSize = {
		width : window.innerWidth,
		height : window.innerHeight
	}

	Memory.camera.aspect = Memory.windowSize.width / Memory.windowSize.height;
	Memory.camera.updateProjectionMatrix();

	Memory.renderer.setSize(window.innerWidth, window.innerHeight);
}

Memory.toState = function(state) {
	Memory.nextState = state;
}

Memory.animate = function() {
	if (Memory.nextState > Memory.STATE_NONE) {
		Memory.state = Memory.nextState;
		Memory.nextState = Memory.STATE_NONE;

		switch (Memory.state) {
		case Memory.STATE_LOAD:
			Memory.load();
			break;

		case Memory.STATE_MENU:
			Menu.activate();
			break;

		case Memory.STATE_GAME:
			Game.activate();
			break;
		}
	}

	// Memory.dings.rotation.x += 0.01;
	// camera.position.x = mouseX * 5;
	// camera.position.y = -18 - mouseY * 5;

	// camera.lookAt(new THREE.Vector3(mouseX * 5, -5, 0));
	// camera.rotation.z = Math.PI / 16 * -mouseX;

	requestAnimationFrame(Memory.animate);
	Memory.renderer.render(Memory.scene, Memory.camera);
	TWEEN.update();
}

Memory.load = function() {
	Menu.load();
	Game.load();

	// Memory.sparkleMaterial =
	// Util.createTexturedMaterial('asset/sparkle.png');
	// Memory.sparkleMaterial.transparent = true;
	// Memory.sparkleMaterial.blending = THREE.AdditiveBlending;
	// Memory.sparkleGeometry = new THREE.PlaneGeometry(2, 2, 1, 1);
	Memory.sparkleMaterial = Util.createParticleMaterial('asset/sparkle.png');
	Memory.sparkleGeometry = new THREE.Geometry();
	Memory.sparkleGeometry.vertices.push(new THREE.Vector3(0, 0, 0));

	Memory.initTable();

	Memory.toState(Memory.STATE_MENU);

	//
	// var cardBottomTexture =
	// THREE.ImageUtils.loadTexture('asset/cardback.png');
	//
	// cardBottomTexture.minFilter = cardBottomTexture.magFilter =
	// THREE.LinearFilter;
	//
	// cardBottomMaterial = new THREE.MeshLambertMaterial({
	// color : 0xffffff,
	// map : cardBottomTexture
	// });
	//
	// cardBottomTexture.wrapS = cardBottomTexture.wrapT = THREE.RepeatWrapping;
	// cardBottomTexture.repeat.set(2, 2);
	//
	// cardSideMaterial = new THREE.MeshLambertMaterial({
	// color : 0x808080
	// });
	//
	// for ( var i = 0; i < boardWidth * boardHeight / 2; i += 1) {
	// var cardTopTexture = THREE.ImageUtils.loadTexture('asset/memory' + i +
	// ".jpg")
	//
	// cardTopTexture.minFilter = cardTopTexture.magFilter = THREE.LinearFilter;
	//
	// cardTopMaterials.push(new THREE.MeshLambertMaterial({
	// color : 0xffffff,
	// map : cardTopTexture
	// }));
	// }
}

Memory.createSparkle = function(position) {

	var particleSystem = new THREE.ParticleSystem(Memory.sparkleGeometry, Memory.sparkleMaterial.clone());

	particleSystem.position = position.clone();

	Memory.scene.add(particleSystem);

	var direction = new THREE.Vector3(Math.random() - 0.5, Math.random() - 0.5, Math.random() - 0.5).normalize();
	var length = 16;

	new TWEEN.Tween({
		posX : position.x,
		posY : position.y,
		posZ : position.z,
		opacity : 1
	}).to({
		posX : position.x + direction.x * length,
		posY : position.y + direction.y * length,
		posZ : position.z + direction.z * length,
		opacity : 0
	}, 2000).onUpdate(function() {
		particleSystem.position.x = this.posX;
		particleSystem.position.y = this.posY;
		particleSystem.position.z = this.posZ;
		particleSystem.material.rotation = this.rotation;
		particleSystem.material.opacity = this.opacity;
	}).onComplete(function() {
		Memory.scene.remove(particleSystem);
	}).easing(TWEEN.Easing.Cubic.Out).start();
}

Memory.initTable = function() {
	 var width = (Game.cardSize + Game.cardSpacing) * 12;
	var height = (Game.cardSize + Game.cardSpacing) * 8;
	var texture = THREE.ImageUtils.loadTexture('asset/table.png');
	var material = new THREE.MeshLambertMaterial({
		color : 0xffffff,
		map : texture
	});

	texture.wrapS = texture.wrapT = THREE.RepeatWrapping;
	texture.repeat.set(width / 10, height / 10);
	texture.offset.set(1.25, 1.25)

	var geometry = new THREE.PlaneGeometry(width, height, 1, 1);
	var mesh = new THREE.Mesh(geometry, material);

	Memory.scene.add(mesh);
}

function initCardDatas() {
	for ( var i = 0; i < boardWidth * boardHeight; i += 2) {
		cardDatas[i] = cardDatas[i + 1] = Math.floor(i / 2);
	}

	for ( var i = 0; i < boardWidth * boardHeight; i++) {
		var j = Math.floor(Math.random() * boardWidth * boardHeight);
		var tmp = cardDatas[i];
		cardDatas[i] = cardDatas[j];
		cardDatas[j] = tmp;
	}
}

// function initCamera() {
// camera = new THREE.PerspectiveCamera(fov, window.innerWidth
// / window.innerHeight, 1, 1000);
//
// var width = totalWidth;
// var height = totalHeight;
// var ratio = (width / height) / (window.innerWidth / window.innerHeight);
// var dist = (height * Math.max(1, ratio) / 2)
// * (1 / Math.tan(Math.PI * fov / 360)) * 1.2;
//
// var v = new THREE.Vector3(0, -0.6, 1.2).normalize();// .multiply(dist);
// var from = new THREE.Vector3(0, -2 * dist, 0);
// var to = new THREE.Vector3(v.x * dist, v.y * dist, v.z * dist);
// var tween = new TWEEN.Tween(from).to(to, boardWidth * boardHeight * 100);
// var onUpdate = function() {
// camera.position = from;
// camera.lookAt(new THREE.Vector3(0, -height / 16, 0));
// };
//
// tween.onUpdate(onUpdate);
// onUpdate();
// tween.start();
//
// Memory.scene.add(camera);
// }

function initRenderer() {
	if (Detector.webgl) {
		renderer = new THREE.WebGLRenderer({
			antialias : true,
			preserveDrawingBuffer : true
		});
	} else {
		Detector.addGetWebGLMessage();
		return;
	}

	renderer.setSize(window.innerWidth, window.innerHeight);

	document.body.appendChild(renderer.domElement);
}

function initScene() {
	initCardMeshes();
}

function initCardMeshes() {
	cardGeometry = new THREE.CubeGeometry(cardSize, cardSize, cardHeight, 1, 1, 1);
	for ( var y = 0; y < boardHeight; y++) {
		for ( var x = 0; x < boardWidth; x++) {
			addCardMesh(x, y);
		}
	}
}

function addCardMesh(x, y) {
	var index = x + y * boardWidth
	var cardMesh = createCardMesh(index)
	var from = {
		x : 0,
		y : -(totalHeight / 2 + 1) - (cardSize + cardSpacing) / 2,
		z : ((boardWidth * boardHeight) - index) * cardHeight,
		r : Math.PI / 8 * (Math.random() - 0.5),
		h : 0
	};
	var targetPosition = calcCardPosition(x, y, 0);
	var to = {
		x : targetPosition.x,
		y : targetPosition.y,
		z : targetPosition.z,
		r : from.r + 2 * Math.PI,
		h : Math.PI
	};

	var tween = new TWEEN.Tween(from).to(to, 400 * Memory.SPEED);
	var onUpdate = function() {
		cardMesh.position.x = from.x;
		cardMesh.position.y = from.y;
		cardMesh.position.z = from.z + Math.sin(from.h) * cardSize;
		cardMesh.rotation.z = from.r;
	};

	tween.onUpdate(onUpdate);
	onUpdate();
	Memory.scene.add(cardMesh);
	tween.start(index * 100);
	cardMeshes.push(cardMesh);
}

function calcCardPosition(x, y, z) {
	var ox = -totalWidth / 2 + (cardSize + cardSpacing) / 2;
	var oy = totalHeight / 2 - (cardSize + cardSpacing) / 2;

	return new THREE.Vector3(ox + x * (cardSize + cardSpacing), oy - y * (cardSize + cardSpacing), z);
}

function createCardMesh(index) {
	var materials = [ cardSideMaterial, cardSideMaterial, cardSideMaterial, cardSideMaterial, cardBottomMaterial,
			cardTopMaterials[cardDatas[index]] ];
	var mesh = new THREE.Mesh(cardGeometry, new THREE.MeshFaceMaterial(materials));

	mesh.index = index;

	return mesh;
}

function animate() {
	// Memory.dings.rotation.x += 0.01;
	// camera.position.x = mouseX * 5;
	// camera.position.y = -18 - mouseY * 5;

	// camera.lookAt(new THREE.Vector3(mouseX * 5, -5, 0));
	// camera.rotation.z = Math.PI / 16 * -mouseX;

	requestAnimationFrame(animate);
	Memory.renderer.render(Memory.scene, Memory.camera);
	TWEEN.update();
}

function onDocumentMouseDown(event) {
	event.preventDefault();

	if (state < 2) {
		var vector = new THREE.Vector3((event.clientX / window.innerWidth) * 2 - 1,
				-(event.clientY / window.innerHeight) * 2 + 1, 0.5);
		projector.unprojectVector(vector, Memory.camera);

		var raycaster = new THREE.Raycaster(Memory.camera.position, vector.sub(Memory.camera.position).normalize());
		var intersects = raycaster.intersectObjects(cardMeshes);

		if ((intersects.length > 0) && (intersects[0])) {
			var cardMesh = intersects[0].object;

			if ((state == 0) || (selectedIndices[0] != cardMesh.index)) {
				if (cardDatas[cardMesh.index] >= 0) {
					showCard(cardMesh);
					selectedIndices[state] = cardMesh.index;
					state += 1;
				}
			}
		}
	} else {
		state = 0;

		if (cardDatas[selectedIndices[0]] == cardDatas[selectedIndices[1]]) {
			var x = -1;
			var y = 1;
			var z = stack * (cardHeight * 2);

			if (stack >= boardWidth * boardHeight / 4) {
				x = boardWidth;
				z = (stack - Math.floor(boardWidth * boardHeight / 4)) * (cardHeight * 2);
			}

			stackCard(cardMeshes[selectedIndices[0]], calcCardPosition(x, y, z));
			cardDatas[selectedIndices[0]] = -1;

			stackCard(cardMeshes[selectedIndices[1]], calcCardPosition(x, y, z + cardHeight));
			cardDatas[selectedIndices[1]] = -1;

			stack += 1;
		} else {
			hideCard(cardMeshes[selectedIndices[0]]);
			hideCard(cardMeshes[selectedIndices[1]]);
		}
	}
}

function showCard(cardMesh) {
	cardMesh.tween = rotateCard(cardMesh, cardMesh.rotation.y, Math.PI);
}

function hideCard(cardMesh) {
	cardMesh.tween = rotateCard(cardMesh, cardMesh.rotation.y, 0);
}

function rotateCard(cardMesh, fromY, toY) {
	if (cardMesh.tween) {
		cardMesh.tween.stop();
	}

	var from = {
		y : fromY,

	};
	var to = {
		y : toY,
	};

	var tween = new TWEEN.Tween(from).to(to, 200 * Memory.SPEED);

	tween.onUpdate(function() {
		cardMesh.rotation.y = from.y;

		cardMesh.position.z = Math.abs(Math.sin(from.y)) * ((cardSize + cardSpacing) / 2);
	});
	tween.onComplete(function() {
		cardMesh.tween = null;
	});

	tween.start();

	return tween;
}

function stackCard(cardMesh, to) {
	var from = {
		posX : cardMesh.position.x,
		posY : cardMesh.position.y,
		posZ : cardMesh.position.z,
		rotZ : cardMesh.rotation.z,
		fact : 0
	};
	var to = {
		posX : to.x,
		posY : to.y,
		posZ : to.z,
		rotZ : cardMesh.rotation.z + Math.PI * 2,
		fact : Math.PI
	};

	var tween = new TWEEN.Tween(from).to(to, 500 * Memory.SPEED);

	tween.onUpdate(function() {
		cardMesh.position.x = from.posX;
		cardMesh.position.y = from.posY;
		cardMesh.position.z = from.posZ + Math.sin(from.fact) * cardSize * 2;
		cardMesh.rotation.z = from.rotZ * 2;
	});
	tween.easing(TWEEN.Easing.Sinusoidal.In);

	tween.start();
}

Memory.init();
Memory.animate();
