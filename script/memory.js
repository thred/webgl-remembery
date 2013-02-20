const
fov = 50;

const
boardWidth = 7;
const
boardHeight = 4;

const
cardSize = 8;
const
cardHeight = 0.4;
const
cardSpacing = 2;
const
totalWidth = boardWidth * (cardSize + cardSpacing);
const
totalHeight = boardHeight * (cardSize + cardSpacing);

var container;
var scene;
var camera;
var projector;
var renderer;

var cardTopMaterials = [];
var cardSideMaterial;
var cardBottomMaterial;
var cardGeometry;
var cardMeshes = [];

var cards = [];
var state = 0;
var selectedIndices = [];
var stack = 0;

var mouseX = 0;
var mouseY = 0;
var windowWidth = 0;
var windowHeight = 0;

init();
animate();

function init() {
	windowWidth = window.innerWidth;
	windowHeight = window.innerHeight;

	scene = new THREE.Scene();

	initCards();

	initCamera();
	initLights();
	initMaterials();
	initScene();

	projector = new THREE.Projector();

	initRenderer();

	document.addEventListener('mousedown', onDocumentMouseDown, false);
	document.addEventListener('mousemove', onDocumentMouseMove, false);
	window.addEventListener('resize', onWindowResize, false);
}

function initCards() {
	for ( var i = 0; i < boardWidth * boardHeight; i += 2) {
		cards[i] = cards[i + 1] = Math.floor(i / 2);
	}

	for ( var i = 0; i < boardWidth * boardHeight; i++) {
		var j = Math.floor(Math.random() * boardWidth * boardHeight);
		var tmp = cards[i];
		cards[i] = cards[j];
		cards[j] = tmp;
	}
}

function initCamera() {
	camera = new THREE.PerspectiveCamera(fov, window.innerWidth
			/ window.innerHeight, 1, 1000);

	camera.position.x = 0;
	camera.position.y = -(totalHeight / 2);
	camera.position.z = (totalHeight / 2) * (1 / Math.tan(Math.PI * fov / 360));

	camera.lookAt(new THREE.Vector3(0, -(totalHeight / 16), 0));

	scene.add(camera);
}

function initLights() {
	scene.add(new THREE.AmbientLight(0x222222));

	var light = new THREE.DirectionalLight(0xfffff0, 0.5);
	light.position.set(0.5, -1, 1).normalize();
	scene.add(light);

	light = new THREE.DirectionalLight(0xfffff0, 1.0);
	light.position.set(-0.5, -1, 1).normalize();

	scene.add(light);

}

function initMaterials() {
	var cardBottomTexture = THREE.ImageUtils.loadTexture('asset/cardback.png');

	cardBottomTexture.minFilter = cardBottomTexture.magFilter = THREE.LinearFilter;

	cardBottomMaterial = new THREE.MeshLambertMaterial({
		color : 0xffffff,
		map : cardBottomTexture
	});

	cardBottomTexture.wrapS = cardBottomTexture.wrapT = THREE.RepeatWrapping;
	cardBottomTexture.repeat.set(2, 2);

	cardSideMaterial = new THREE.MeshLambertMaterial({
		color : 0x808080
	});

	for ( var i = 0; i < boardWidth * boardHeight / 2; i += 1) {
		var cardTopTexture = THREE.ImageUtils.loadTexture('asset/memory' + i
				+ ".jpg")

		cardTopTexture.minFilter = cardTopTexture.magFilter = THREE.LinearFilter;

		cardTopMaterials.push(new THREE.MeshLambertMaterial({
			color : 0xffffff,
			map : cardTopTexture
		}));
	}
}

function initScene() {
	initTable();

	initGeometries();
	initMeshes();
}

function initTable() {
	var width = totalWidth + (cardSize + cardSpacing) * 3;
	var height = totalHeight + (cardSize + cardSpacing);
	var texture = THREE.ImageUtils.loadTexture('asset/background.png');
	var material = new THREE.MeshLambertMaterial({
		color : 0xffffff,
		map : texture
	});

	texture.wrapS = texture.wrapT = THREE.RepeatWrapping;
	texture.repeat.set(width / 5, height / 5);
	texture.offset.set(1.25, 1.25)

	var geometry = new THREE.PlaneGeometry(width, height, 1, 1);
	var mesh = new THREE.Mesh(geometry, material);

	mesh.position.z = -cardHeight / 2;

	scene.add(mesh);
}

function initGeometries() {
	cardGeometry = new THREE.CubeGeometry(cardSize, cardSize, cardHeight, 1, 1,
			1);
}

function initMeshes() {
	for ( var y = 0; y < boardHeight; y++) {
		for ( var x = 0; x < boardWidth; x++) {
			card = createCard(x + y * boardWidth);

			card.position = calcCardPosition(x, y, 0);
			card.rotation.z = Math.PI / 16 * (Math.random() - 0.5);

			scene.add(card);

			cardMeshes.push(card);
		}
	}
}

function calcCardPosition(x, y, z) {
	var ox = -totalWidth / 2 + (cardSize + cardSpacing) / 2;
	var oy = -totalHeight / 2 + (cardSize + cardSpacing) / 2;

	return new THREE.Vector3(ox + x * (cardSize + cardSpacing), oy + y
			* (cardSize + cardSpacing), z);
}

function createCard(index) {
	var materials = [ cardSideMaterial, cardSideMaterial, cardSideMaterial,
			cardSideMaterial, cardBottomMaterial,
			cardTopMaterials[cards[index]] ];
	var mesh = new THREE.Mesh(cardGeometry, new THREE.MeshFaceMaterial(
			materials));

	mesh.index = index;

	return mesh;
}

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

function animate() {

	// camera.position.x = mouseX * 5;
	// camera.position.y = -18 - mouseY * 5;

	// camera.lookAt(new THREE.Vector3(mouseX * 5, -5, 0));
	// camera.rotation.z = Math.PI / 16 * -mouseX;

	requestAnimationFrame(animate);
	renderer.render(scene, camera);
	TWEEN.update();
}

function onDocumentMouseDown(event) {
	event.preventDefault();

	if (state < 2) {
		var vector = new THREE.Vector3(
				(event.clientX / window.innerWidth) * 2 - 1,
				-(event.clientY / window.innerHeight) * 2 + 1, 0.5);
		projector.unprojectVector(vector, camera);

		var raycaster = new THREE.Raycaster(camera.position, vector.sub(
				camera.position).normalize());
		var intersects = raycaster.intersectObjects(cardMeshes);

		if ((intersects.length > 0) && (intersects[0])) {
			var cardMesh = intersects[0].object;

			if ((state == 0) || (selectedIndices[0] != cardMesh.index)) {
				if (cards[cardMesh.index] >= 0) {
					showCard(cardMesh);
					selectedIndices[state] = cardMesh.index;
					state += 1;
				}
			}
		}
	} else {
		state = 0;

		if (cards[selectedIndices[0]] == cards[selectedIndices[1]]) {
			var x = -1;
			var y = boardHeight - 2;
			var z = stack * (cardHeight * 2);

			if (stack >= boardWidth * boardHeight / 4) {
				x = boardWidth;
				z = (stack - Math.floor(boardWidth * boardHeight / 4))
						* (cardHeight * 2);
			}

			stackCard(cardMeshes[selectedIndices[0]], calcCardPosition(x, y, z));
			cards[selectedIndices[0]] = -1;

			stackCard(cardMeshes[selectedIndices[1]], calcCardPosition(x, y, z
					+ cardHeight));
			cards[selectedIndices[1]] = -1;

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

	var tween = new TWEEN.Tween(from).to(to, 200);

	tween.onUpdate(function() {
		cardMesh.rotation.y = from.y;

		cardMesh.position.z = Math.abs(Math.sin(from.y))
				* ((cardSize + cardSpacing) / 2);
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

	var tween = new TWEEN.Tween(from).to(to, 500);

	tween.onUpdate(function() {
		cardMesh.position.x = from.posX;
		cardMesh.position.y = from.posY;
		cardMesh.position.z = from.posZ + Math.sin(from.fact) * cardSize * 2;
		cardMesh.rotation.z = from.rotZ * 2;
	});
	tween.easing(TWEEN.Easing.Sinusoidal.In);

	tween.start();
}

function onDocumentMouseMove(event) {
	mouseX = (event.clientX - windowWidth / 2) / (windowWidth / 2);
	mouseY = (event.clientY - windowHeight / 2) / (windowHeight / 2);
}

function onWindowResize() {
	windowWidth = window.innerWidth;
	windowHeight = window.innerHeight;

	camera.aspect = windowWidth / windowHeight;
	camera.updateProjectionMatrix();

	renderer.setSize(window.innerWidth, window.innerHeight);
}
