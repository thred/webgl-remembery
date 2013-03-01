var Game = Game || {
	STATE_OPEN_FIRST : 0,
	STATE_OPEN_SECOND : 1,
	STATE_CLOSE : 2,

	boardSize : {
		width : 4,
		height : 2
	},

	cardMeshes : [],

	numberOfCards : 22,

	cardSize : 8,
	cardThickness : 0.8,
	cardSpacing : 2,

	cardDatas : [],
	selectedIndices : [ -1, -1 ],
	leftStackSize : 0,
	rightStackSize : 0
}

Game.activate = function() {
	Game.state = Game.STATE_OPEN_FIRST;
	Game.initCardDatas();

	for ( var y = 0; y < Game.boardSize.height; y += 1) {
		for ( var x = 0; x < Game.boardSize.width; x += 1) {
			Game.cardFlyIn(x, y);
		}
	}

	var viewWidth = Game.boardSize.width * (Game.cardSize + Game.cardSpacing);
	var viewHeight = Game.boardSize.height * (Game.cardSize + Game.cardSpacing);

	Memory.tweenCameraTo(new THREE.Vector3(0, -1.2, 0.6), new THREE.Vector3(0, 0, 0), viewWidth, viewHeight,
			1000 * Memory.SPEED).start();

	Util.schedule(function() {
		Memory.tweenCameraTo(new THREE.Vector3(0, -0.6, 1.2), new THREE.Vector3(0, -viewHeight / 16, 0), viewWidth,
				viewHeight, (Game.boardSize.width * 200 + 400) * Memory.SPEED).start();
	}, Game.boardSize.width * (Game.boardSize.height - 1) * 200 * Memory.SPEED);

	Memory.setClick(Game.onClick);
}

Game.onClickMesh = function(mesh) {
	var index = mesh.index;

	if ((Game.state == Game.STATE_OPEN_FIRST) || (Game.state == Game.STATE_OPEN_SECOND)) {
		Game.showCard(index);
	}

	return true;
}

Game.onClick = function() {
	if (Game.state == Game.STATE_CLOSE) {
		if (!Game.collectCards()) {
			Game.hideCards();
		}
		return true;
	}

	return false;
}

Game.showCard = function(index) {
	var cardData = Game.cardDatas[index];

	if (cardData.shown) {
		return;
	}

	if (Game.state == Game.STATE_OPEN_FIRST) {
		Game.selectedIndices[0] = index;
		Game.state = Game.STATE_OPEN_SECOND;
	} else {
		Game.selectedIndices[1] = index;
		Game.state = Game.STATE_CLOSE;
	}

	cardData.shown = true;

	Game.cardShowTween(Game.cardMeshes[cardData.meshIndex]).start();
}

Game.hideCards = function() {
	for ( var i = 0; i < Game.selectedIndices.length; i += 1) {
		Game.hideCard(Game.selectedIndices[i]);
	}

	Game.state = Game.STATE_OPEN_FIRST;
}

Game.hideCard = function(index) {
	var cardData = Game.cardDatas[index];

	if (!cardData.shown) {
		alert("Should not happen!");
		return;
	}

	Game.cardHideTween(Game.cardMeshes[cardData.meshIndex]).onComplete(function() {
		cardData.shown = false;
	}).start();
}

Game.collectCards = function() {
	if (Game.cardDatas[Game.selectedIndices[0]].cardIndex != Game.cardDatas[Game.selectedIndices[1]].cardIndex) {
		return false;
	}

	Game.collectCard(Game.selectedIndices[0]).start();
	Game.collectCard(Game.selectedIndices[1]).delay(100).start();

	Game.state = Game.STATE_OPEN_FIRST;

	return true;
}

Game.collectCard = function(index) {
	var cardData = Game.cardDatas[index];

	if (!cardData.shown) {
		alert("Should not happen!");
		return;
	}

	var mesh = Game.cardMeshes[cardData.meshIndex];

	Memory.removeClickable(mesh);

	return Game.cardCollectTween(mesh, Game.calcCardCollectPosition(-1, 1, Game.leftStackSize++));
}

Game.initCardDatas = function() {
	var cardIndices = [];

	for ( var i = 0; i < Game.numberOfCards; i += 1) {
		cardIndices.push(i);
	}

	Util.shuffle(cardIndices);

	Game.cardDatas = [];

	for ( var i = 0; i < Game.boardSize.width * Game.boardSize.height; i += 2) {
		var cardIndex = cardIndices[parseInt(i / 2)];

		Game.cardDatas.push({
			cardIndex : cardIndex,
			meshIndex : cardIndex * 2,
			shown : false
		});
		Game.cardDatas.push({
			cardIndex : cardIndex,
			meshIndex : cardIndex * 2 + 1,
			shown : false
		});
	}

	Util.shuffle(Game.cardDatas);
}

Game.cardFlyIn = function(x, y) {
	var index = x + Game.boardSize.width * y;
	var cardData = Game.cardDatas[index];
	var mesh = Game.cardMeshes[cardData.meshIndex];

	mesh.index = index;
	mesh.position = Game.calcCardStartPosition(x, y);
	mesh.rotation.z = (Math.random() - 0.5) * (Math.PI / 8);
	mesh.visible = true;

	var targetPosition = Game.calcCardPosition(x, y);

	new TWEEN.Tween({
		x : mesh.position.x,
		y : mesh.position.y,
		z : mesh.position.z,
		r : mesh.rotation.z,
		h : 0
	}).to({
		x : targetPosition.x,
		y : targetPosition.y,
		z : targetPosition.z,
		r : mesh.rotation.z + 2 * Math.PI,
		h : Math.PI
	}, 400 * Memory.SPEED).onUpdate(function() {
		mesh.position.x = this.x;
		mesh.position.y = this.y;
		mesh.position.z = this.z + Math.sin(this.h) * Game.cardSize;
		mesh.rotation.z = this.r;
	}).onComplete(function() {
		Memory.addClickable(mesh, Game.onClickMesh);
	}).delay(1500 * Memory.SPEED + index * 200 * Memory.SPEED).start();
}

Game.cardShowTween = function(mesh) {
	return new TWEEN.Tween({
		rot : mesh.rotation.y,
		height : 0
	}).to({
		rot : Util.round(mesh.rotation.y + Math.PI, Math.PI, Math.PI * 2),
		height : Math.PI
	}, 200 * Memory.SPEED).onUpdate(function() {
		mesh.position.z = (Game.cardThickness / 2) + Math.sin(this.height) * Game.cardSize;
		mesh.rotation.y = this.rot;
	});
}

Game.cardHideTween = function(mesh) {
	return new TWEEN.Tween({
		height : 0,
		rot : mesh.rotation.y
	}).to({
		height : Math.PI,
		rot : Util.round(mesh.rotation.y + Math.PI, 0, Math.PI * 2)
	}, 200 * Memory.SPEED).onUpdate(function() {
		mesh.position.z = (Game.cardThickness / 2) + Math.sin(this.height) * Game.cardSize;
		mesh.rotation.y = this.rot;
	});
}

Game.cardCollectTween = function(mesh, position) {
	return new TWEEN.Tween({
		posX : mesh.position.x,
		posY : mesh.position.y,
		posZ : mesh.position.z,
		rot : mesh.rotation.z,
		fact : 0
	}).to({
		posX : position.x,
		posY : position.y,
		posZ : position.z,
		rot : mesh.rotation.z + Math.random() * Math.PI * 2 + Math.PI * 6,
		fact : Math.PI
	}, 600 * Memory.SPEED).onUpdate(function() {
		mesh.position.x = this.posX;
		mesh.position.y = this.posY;
		mesh.position.z = this.posZ + Math.sin(this.fact) * Game.cardSize * 2;
		mesh.rotation.z = this.rot;

		Memory.createSparkle(mesh.position.clone());
	});
}

Game.createSparkleA = function(position) {
	var particle = new THREE.ParticleSystem(Game.sparkleGeometry, Game.sparkleMaterial);

	particle.position = position;
	Memory.scene.add(particle);

	var dir = new THREE.Vector3(Math.random() - 0.5, Math.random() - 0.5, Math.random() - 0.5).normalize();
	var length = Game.cardSize;

	new TWEEN.Tween({
		posX : position.x,
		posY : position.y,
		posZ : position.z
	}).to({
		posX : position.x + dir.x * length,
		posY : position.y + dir.y * length,
		posZ : position.z + dir.z * length
	}, 1000).onUpdate(function() {
		particle.position.x = this.posX;
		particle.position.y = this.posY;
		particle.position.z = this.posZ;
	}).onComplete(function() {
		Memory.scene.remove(particle);
	}).start();
}

Game.calcCardPosition = function(x, y) {
	var index = x + Game.boardSize.width * y;
	var ox = (Game.cardSize + Game.cardSpacing) * (x - ((Game.boardSize.width - 1) / 2));
	var oy = -(Game.cardSize + Game.cardSpacing) * (y - ((Game.boardSize.height - 1) / 2));

	return new THREE.Vector3(ox, oy, Game.cardThickness / 2);
}

Game.calcCardStartPosition = function(x, y) {
	var index = x + Game.boardSize.width * y;
	var oy = -(Game.cardSize + Game.cardSpacing) * (Game.boardSize.height - ((Game.boardSize.height - 1) / 2));

	return new THREE.Vector3(0, oy, Game.cardThickness / 2 + Game.cardThickness
			* ((Game.boardSize.width * Game.boardSize.height) - index));
}

Game.calcCardCollectPosition = function(x, y, stackSize) {
	var ox = (Game.cardSize + Game.cardSpacing) * (x - ((Game.boardSize.width - 1) / 2));
	var oy = -(Game.cardSize + Game.cardSpacing) * (y - ((Game.boardSize.height - 1) / 2));
	var oz = Game.cardThickness / 2 + stackSize * Game.cardThickness;

	return new THREE.Vector3(ox, oy, oz);
}

Game.load = function() {
	var cardGeometry = Game.createCardGeometry();
	var bottomCardMaterial = Util.createTexturedMaterial('asset/cardback.png', 2);
	var sideCardMaterial = Util.createColoredMaterial(0x808080);

	for ( var i = 0; i < Game.numberOfCards; i += 1) {
		var topCardMaterial = Util.createTexturedMaterial('asset/memory' + (i % 22) + ".jpg", 1);

		for ( var j = 0; j < 2; j += 1) {
			var cardMesh = Game.cardMeshes[i * 2 + j] = Game.createCardMesh(cardGeometry, topCardMaterial,
					bottomCardMaterial, sideCardMaterial);

			cardMesh.visible = false;
			Memory.scene.add(cardMesh);
		}
	}
}

Game.createCardGeometry = function() {
	return new THREE.CubeGeometry(Game.cardSize, Game.cardSize, Game.cardThickness, 1, 1, 1);
}

Game.createCardMesh = function(geometry, topMaterial, bottomMaterial, sideMaterial) {
	var materials = [ sideMaterial, sideMaterial, sideMaterial, sideMaterial, bottomMaterial, topMaterial ];
	var mesh = new THREE.Mesh(geometry, new THREE.MeshFaceMaterial(materials));

	return mesh;
}
