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

var width = 6;
var height = 4;
var cards = [];
var state = 0;
var selectedIndices = [];
var stack = 0;

init();
animate();

function init() {
	scene = new THREE.Scene();

	initCards();

	initCamera();
	initLights();
	initMaterials();
	initGeometries();
	initMeshes();

	projector = new THREE.Projector();

	initRenderer();

	document.addEventListener('mousedown', onDocumentMouseDown, false);
	window.addEventListener('resize', onWindowResize, false);
}

function initCards() {
	for ( var i = 0; i < width * height; i += 2) {
		cards[i] = cards[i + 1] = Math.floor(i / 2);
	}

	for ( var i = 0; i < width * height; i++) {
		var j = Math.floor(Math.random() * width * height);
		var tmp = cards[i];
		cards[i] = cards[j];
		cards[j] = tmp;
	}
}

function initCamera() {
	camera = new THREE.PerspectiveCamera(70, window.innerWidth / window.innerHeight, 1, 1000);
	camera.position.x = 0;
	camera.position.y = -20;
	camera.position.z = 30;
	camera.rotation.x = Math.PI / 8;

	scene.add(camera);
}

function initLights() {
	scene.add(new THREE.AmbientLight(0x808080));

	var light = new THREE.DirectionalLight(0xffffff, 1);
	light.position.set(-0.5, 1, 1).normalize();
	scene.add(light);
}

function initMaterials() {
	cardBottomMaterial = new THREE.MeshLambertMaterial({
		color : 0xffffff,
		map : THREE.ImageUtils.loadTexture('asset/background.jpg')
	});

	cardSideMaterial = new THREE.MeshLambertMaterial({
		color : 0x808080
	});

	for ( var i = 0; i < width * height / 2; i += 1) {
		cardTopMaterials.push(new THREE.MeshLambertMaterial({
			color : 0xffffff,
			map : THREE.ImageUtils.loadTexture('asset/memory' + i + ".jpg")
		}));
	}
}

function initGeometries() {
	cardGeometry = new THREE.CubeGeometry(8, 8, 0.3, 1, 1, 1);
}

function initMeshes() {
	for ( var y = 0; y < height; y++) {
		for ( var x = 0; x < width; x++) {
			card = createCard(x + y * width);

			card.position = calcCardPosition(x, y, 0);
			// card.rotation.y = Math.PI;
			card.rotation.z = Math.PI / 16 * (Math.random() - 0.5);

			scene.add(card);

			cardMeshes.push(card);
		}
	}
}

function calcCardPosition(x, y, z) {
	var ox = (-width * 8 + 7) / 2 - 4;
	var oy = (-height * 8 + 7) / 2 - 4;

	return new THREE.Vector3(ox + x * 9, oy + y * 9, z);
}

function createCard(index) {
	var materials = [ cardSideMaterial, cardSideMaterial, cardSideMaterial, cardSideMaterial, cardBottomMaterial,
			cardTopMaterials[cards[index]] ];
	var card = new THREE.Mesh(cardGeometry, new THREE.MeshFaceMaterial(materials));

	card.index = index;

	return card;
}

function initRenderer() {
	renderer = new THREE.WebGLRenderer();
	renderer.setSize(window.innerWidth, window.innerHeight);

	document.body.appendChild(renderer.domElement);
}

function animate() {
	requestAnimationFrame(animate);
	renderer.render(scene, camera);
	TWEEN.update();

	// for ( var i = 0; i < cards.length; i++) {
	// cards[i].rotation.x += 0.02;
	// cards[i].rotation.y += 0.01;
	// }
}

function onDocumentMouseDown(event) {
	event.preventDefault();

	if (state < 2) {
		var vector = new THREE.Vector3((event.clientX / window.innerWidth) * 2 - 1,
				-(event.clientY / window.innerHeight) * 2 + 1, 0.5);
		projector.unprojectVector(vector, camera);

		var raycaster = new THREE.Raycaster(camera.position, vector.sub(camera.position).normalize());
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
			var y = height - 2;
			var z = stack * 0.6;

			if (stack >= width * height / 4) {
				x = width;
				z = (stack - Math.floor(width * height / 4)) * 0.6;
			}

			stackCard(cardMeshes[selectedIndices[0]], calcCardPosition(x, y, z));

			// cardMeshes[selectedIndices[0]].position = calcCardPosition(x, y);
			// cardMeshes[selectedIndices[0]].position.z = z;
			// cardMeshes[selectedIndices[0]].rotation.z = Math.PI / 16 *
			// (Math.random() -
			// 0.5);
			cards[selectedIndices[0]] = -1;

			stackCard(cardMeshes[selectedIndices[1]], calcCardPosition(x, y, z + 0.3));

			// cardMeshes[selectedIndices[1]].position = calcCardPosition(x, y);
			// cardMeshes[selectedIndices[1]].position.z = z + 0.3;
			// cardMeshes[selectedIndices[1]].rotation.z = Math.PI / 16 *
			// (Math.random() -
			// 0.5);
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
		y : fromY
	};
	var to = {
		y : toY
	};

	var tween = new TWEEN.Tween(from).to(to, 200);

	tween.onUpdate(function() {
		cardMesh.rotation.y = from.y;
		cardMesh.position.z = Math.sin(from.y) * 5;
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
		cardMesh.position.z = from.posZ + Math.sin(from.fact) * 8;
		cardMesh.rotation.z = from.rotZ;
	});
	tween.easing(TWEEN.Easing.Sinusoidal.In);

	tween.start();
}

function onWindowResize() {
	camera.aspect = window.innerWidth / window.innerHeight;
	camera.updateProjectionMatrix();

	renderer.setSize(window.innerWidth, window.innerHeight);
}
