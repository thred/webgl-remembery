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
	rightStackSize : 0,

	points : 0,
	pointsPerCount : [ 100, 100, 100, 50, 30, 20, 10, 5, 2, 1 ]
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

	Memory.tweenCameraLocate(new THREE.Vector3(0, -viewHeight / 16, 0), new THREE.Vector2(-0.6, 1.2), 0, viewWidth,
			viewHeight, 5000).start();

	// Memory.tweenCameraTo(new THREE.Vector3(0, 0, 0), new THREE.Vector3(0,
	// -1.2, 0.6), viewWidth, viewHeight,
	// 1000 * Memory.SPEED).start();

//	Util.schedule(function() {
//		Memory.tweenCameraTo(new THREE.Vector3(0, -viewHeight / 16, 0), new THREE.Vector3(0, -0.6, 1.2), viewWidth,
//				viewHeight, (Game.boardSize.width * 200 + 400) * Memory.SPEED).start();
//	}, Game.boardSize.width * (Game.boardSize.height - 1) * 200 * Memory.SPEED);

	Memory.setClick(Game.onClick);
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
			shown : false,
			count : 0
		});
		Game.cardDatas.push({
			cardIndex : cardIndex,
			meshIndex : cardIndex * 2 + 1,
			shown : false,
			count : 0
		});
	}

	Util.shuffle(Game.cardDatas);
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
		if (Game.collectCards()) {
			if (Game.leftStackSize + Game.rightStackSize >= Game.boardSize.width * Game.boardSize.height) {
				Score.points = Game.points;
				Score.maxPoints = Game.boardSize.width * Game.boardSize.height * Game.pointsPerCount[0];

				Memory.toState(Memory.STATE_SCORE);
			}
		} else {
			Game.hideCards();
		}
		return true;
	}

	return false;
}

Game.cardFlyIn = function(x, y) {
	var index = x + Game.boardSize.width * y;
	var cardData = Game.cardDatas[index];
	var mesh = Game.cardMeshes[cardData.meshIndex];

	mesh.index = index;
	mesh.position = Game.calcCardStartPosition(x, y);
	mesh.rotation.z = (Math.random() - 0.5) * (Math.PI / 8);
	mesh.visible = true;

	Game.cardFlyInTween(mesh, Game.calcCardPosition(x, y)).delay((1500 + index * 200) * Memory.SPEED).start();
}

Game.showCard = function(index) {
	var cardData = Game.cardDatas[index];

	if (cardData.shown) {
		return;
	}

	cardData.count += 1;

	if (Game.state == Game.STATE_OPEN_FIRST) {
		Game.selectedIndices[0] = index;
		Game.state = Game.STATE_OPEN_SECOND;
	} else {
		Game.selectedIndices[1] = index;
		Game.state = Game.STATE_CLOSE;

		Game.hoverCards();
	}

	cardData.shown = true;

	Game.cardShowTween(Game.cardMeshes[cardData.meshIndex]).start();
}

Game.hideCards = function() {
	Game.hideCard(Game.selectedIndices[0]).start();
	Game.hideCard(Game.selectedIndices[1]).delay(100 * Memory.SPEED).start();

	Game.state = Game.STATE_OPEN_FIRST;
}

Game.hideCard = function(index) {
	var cardData = Game.cardDatas[index];

	if (!cardData.shown) {
		alert("Should not happen!");
		return;
	}

	return Game.cardHideTween(Game.cardMeshes[cardData.meshIndex]).onComplete(function() {
		cardData.shown = false;
	});
}

Game.hoverCards = function() {
	if (Game.cardDatas[Game.selectedIndices[0]].cardIndex != Game.cardDatas[Game.selectedIndices[1]].cardIndex) {
		return false;
	}

	Memory.addBlock();

	Game.hoverCard(Game.selectedIndices[0], -0.5).delay(300 * Memory.SPEED).start();
	Game.hoverCard(Game.selectedIndices[1], 0.5).delay(400 * Memory.SPEED).start();

	Util.schedule(Memory.removeBlock, 400 * Memory.SPEED);

	return true;
}

Game.hoverCard = function(index, positionOffset) {
	var cardData = Game.cardDatas[index];
	var mesh = Game.cardMeshes[cardData.meshIndex];

	Memory.removeClickable(mesh);

	var position = Memory.camera.position.clone();
	var length = position.length();

	position.normalize().setLength(length / 2);
	position.x += positionOffset * (Game.cardSize + Game.cardSpacing);

	return Game.cardHoverTween(mesh, position);
}

Game.collectCards = function() {
	if (Game.cardDatas[Game.selectedIndices[0]].cardIndex != Game.cardDatas[Game.selectedIndices[1]].cardIndex) {
		return false;
	}

	Game.collectCard(Game.selectedIndices[0]).start();
	Game.collectCard(Game.selectedIndices[1]).delay(100 * Memory.SPEED).start();

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

	Game.points += Game.pointsPerCount[(cardData.count < Game.pointsPerCount.length) ? cardData.count
			: Game.pointsPerCount.length - 1];

	return Game.cardCollectTween(mesh, Game.calcCardCollectPosition(-1, 1, Game.leftStackSize++));
}

Game.cardFlyInTween = function(mesh, position) {
	var from = {
		x : mesh.position.x,
		y : mesh.position.y,
		z : mesh.position.z,
		r : mesh.rotation.z,
		h : 0
	};
	var to = {
		x : position.x,
		y : position.y,
		z : position.z,
		r : mesh.rotation.z + 2 * Math.PI,
		h : Math.PI
	};
	var update = function() {
		mesh.position.x = this.x;
		mesh.position.y = this.y;
		mesh.position.z = this.z + Math.sin(this.h) * Game.cardSize;
		mesh.rotation.z = this.r;
	}
	var complete = function() {
		Memory.removeBlock();
		Memory.addClickable(mesh, Game.onClickMesh);
	}

	return new TWEEN.Tween(from).to(to, 400 * Memory.SPEED).onStart(Memory.addBlock).onUpdate(update).onComplete(
			complete);
}

Game.cardShowTween = function(mesh) {
	var from = {
		rot : mesh.rotation.y,
		height : 0
	};
	var to = {
		rot : Util.round(mesh.rotation.y + Math.PI, Math.PI, Math.PI * 2),
		height : Math.PI
	};
	var update = function() {
		mesh.position.z = (Game.cardThickness / 2) + Math.sin(this.height) * Game.cardSize;
		mesh.rotation.y = this.rot;
	}

	return new TWEEN.Tween(from).to(to, 200 * Memory.SPEED).onUpdate(update);
}

Game.cardHideTween = function(mesh) {
	var from = {
		height : 0,
		rot : mesh.rotation.y
	};
	var to = {
		height : Math.PI,
		rot : Util.round(mesh.rotation.y + Math.PI, 0, Math.PI * 2)
	};
	var update = function() {
		mesh.position.z = (Game.cardThickness / 2) + Math.sin(this.height) * Game.cardSize;
		mesh.rotation.y = this.rot;
	}

	return new TWEEN.Tween(from).to(to, 200 * Memory.SPEED).onUpdate(update);
}

Game.cardHoverTween = function(mesh, position) {
	var from = {
		posX : mesh.position.x,
		posY : mesh.position.y,
		posZ : mesh.position.z,
		rot : mesh.rotation.z
	};
	var to = {
		posX : position.x,
		posY : position.y,
		posZ : position.z,
		rot : Util.round(mesh.rotation.z + Math.PI * 4, 0, Math.PI * 2)
	};
	var update = function() {
		mesh.position.x = this.posX;
		mesh.position.y = this.posY;
		mesh.position.z = this.posZ;
		mesh.rotation.z = this.rot;

		Memory.createSparkle(mesh.position.clone());
	}

	return new TWEEN.Tween(from).to(to, 1000 * Memory.SPEED).easing(TWEEN.Easing.Cubic.InOut).onStart(Memory.addBlock)
			.onUpdate(update).onComplete(Memory.removeBlock);
}

Game.cardCollectTween = function(mesh, position) {
	var from = {
		posX : mesh.position.x,
		posY : mesh.position.y,
		posZ : mesh.position.z,
		rot : mesh.rotation.z,
		fact : 0
	};
	var to = {
		posX : position.x,
		posY : position.y,
		posZ : position.z,
		rot : mesh.rotation.z + Math.random() * Math.PI * 2 + Math.PI * 6,
		fact : Math.PI
	};
	var update = function() {
		mesh.position.x = this.posX;
		mesh.position.y = this.posY;
		mesh.position.z = this.posZ + Math.sin(this.fact) * Game.cardSize;
		mesh.rotation.z = this.rot;
		Memory.createSparkle(mesh.position.clone());
	}

	return new TWEEN.Tween(from).to(to, 600 * Memory.SPEED).easing(TWEEN.Easing.Quadratic.Out).onUpdate(update);
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
