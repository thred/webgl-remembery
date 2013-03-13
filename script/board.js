$.Board = function() {
	this.NUMBER_OF_CARDS = 25;
};

$.Board.prototype.setBoardSize = function(boardWidth, boardHeight) {
	this.boardSize = {
		width: boardWidth,
		height: boardHeight
	};
};

$.Board.prototype.activate = function() {
	var self = this;

	var fieldWidth = this.boardSize.width * ($.CARD_SIZE + $.CARD_SPACING);
	var fieldHeight = this.boardSize.height * ($.CARD_SIZE + $.CARD_SPACING);
	var tableWidth = (this.boardSize.width + 2) * ($.CARD_SIZE + $.CARD_SPACING);
	var tableHeight = (this.boardSize.height + 2) * ($.CARD_SIZE + $.CARD_SPACING);

	this.offset = new THREE.Vector3($.camera.x, $.camera.y, - $.camera.computeDistance(tableWidth, tableHeight));
	this.tableObject = this.createTableObject(tableWidth, tableHeight);

	$.scene.add(this.tableObject);

	this.initCardDatas();

	this.tableObject.growTween(2000 * $.SPEED).delay(1000 * $.SPEED).start();

	var delay = 2000 * $.SPEED;
	for (var y = this.boardSize.height - 1; y >= 0; y -= 1) {
		for (var x = this.boardSize.width - 1; x >= 0; x -= 1) {
			var i = x + y * this.boardSize.width;
			var cardObject = this.cardObjects[this.cardDatas[i].objectIndex];

			cardObject.growTween(1000 * $.SPEED).delay(delay).start();

			delay += 50 * $.SPEED;
		}
	}

	delay += 100 * $.SPEED;

	for (var y = 0; y < this.boardSize.height; y += 1) {
		for (var x = 0; x < this.boardSize.width; x += 1) {
			var i = x + y * this.boardSize.width;
			var cardObject = this.cardObjects[this.cardDatas[i].objectIndex];
			var position = this.computeCardPosition(x, y);

			cardObject.flyInTween(position).delay(delay + 1000 * $.SPEED).start();

			delay += 100 * $.SPEED;
		}
	}

	delay += 2000 * $.SPEED;

	$.camera.locateTween(new THREE.Vector3(this.offset.x, this.offset.y, this.offset.z), Math.PI / 16 * 7, - this.offset.z, 0,
	1000 * $.SPEED).onComplete(function() {
		$.camera.locateTween(new THREE.Vector3(self.offset.x, self.offset.y - fieldHeight * 0.1, self.offset.z), [-Math.PI / 8 * 3, Math.PI / 8 * 3], $.camera.computeDistance(fieldWidth, fieldHeight), Math.PI * 2,
		delay).start();
	}).start();
	//	$.camera.locateTween(new THREE.Vector3(0, 0, this.zOffset), Math.PI / 2, $.camera.computeDistance(fieldWidth, fieldHeight), 0,
	//	1000 * $.SPEED).onComplete(function() {
	//		$.camera.locateTween(new THREE.Vector3(0, 0, self.zOffset), Math.PI / 16, $.camera.computeDistance(fieldWidth, fieldHeight), 0,
	//		delay / 2).onComplete(function() {
	//			$.camera.locateTween(new THREE.Vector3(0, - $.CARD_SIZE / 2, self.zOffset), Math.PI / 8 * 3, $.camera.computeDistance(fieldWidth, fieldHeight), 0,
	//			1000 * $.SPEED).delay(delay / 2).start();
	//		}).start();
	//	}).start();
};

$.Board.prototype.animate = function(time) {};

$.Board.prototype.initCardDatas = function() {
	var cardIndices = [];

	for (var i = 0; i < this.NUMBER_OF_CARDS; i += 1) {
		cardIndices.push(i);
	}

	Util.shuffle(cardIndices);

	this.cardDatas = [];

	for (var i = 0; i < this.boardSize.width * this.boardSize.height; i += 2) {
		var cardIndex = cardIndices[parseInt(i / 2)];

		this.cardDatas.push({
			cardIndex: cardIndex,
			objectIndex: cardIndex * 2,
			shown: false,
			count: 0
		});
		this.cardDatas.push({
			cardIndex: cardIndex,
			objectIndex: cardIndex * 2 + 1,
			shown: false,
			count: 0
		});
	}

	Util.shuffle(this.cardDatas);

	for (var y = 0; y < this.boardSize.height; y += 1) {
		for (var x = 0; x < this.boardSize.width; x += 1) {
			var i = x + y * this.boardSize.width;
			var cardObject = this.cardObjects[this.cardDatas[i].objectIndex];

			cardObject.position = this.computeCardStartPosition(x, y);
			cardObject.rotation.z = (Math.random() - 0.5) * Math.PI / 8;
		}
	}
};

$.Board.prototype.computeCardPosition = function(x, y) {
	var index = x + this.boardSize.width * y;
	var ox = ($.CARD_SIZE + $.CARD_SPACING) * (x - ((this.boardSize.width - 1) / 2));
	var oy = -($.CARD_SIZE + $.CARD_SPACING) * (y - ((this.boardSize.height - 1) / 2));

	return new THREE.Vector3(this.offset.x + ox, this.offset.y + oy, this.offset.z + $.CARD_THICKNESS);
};

$.Board.prototype.computeCardStartPosition = function(x, y) {
	var index = x + this.boardSize.width * y;
	var oy = -($.CARD_SIZE + $.CARD_SPACING) * (this.boardSize.height - ((this.boardSize.height - 1) / 2));

	return new THREE.Vector3(this.offset.x, this.offset.y + oy, this.offset.z + $.CARD_THICKNESS / 2 + $.CARD_THICKNESS * ((this.boardSize.width * this.boardSize.height) - index));
};

$.Board.prototype.load = function() {
	this.tableObject = this.loadTable();
	$.scene.add(this.tableObject);

	this.loadCards();
};

$.Board.prototype.loadTable = function() {
	this.tableFrontMaterial = Util.createTexturedMaterial("asset/table.png", 10);
	this.tableSideMaterial = Util.createColoredMaterial(0xff0000);
};

$.Board.prototype.createTableObject = function(width, height) {
	var geometry = new THREE.ExtrudeGeometry(Util.createRoundedRectangleShape(width, height, 6), {
		amount: 2,
		bevelSegments: 2,
		steps: 2,
		bevelSize: 1,
		bevelThickness: 1,
		material: 0,
		extrudeMaterial: 1
	});

	geometry.computeFaceNormals();
	geometry.computeVertexNormals();
	geometry.computeTangents();
	geometry.computeBoundingBox();
	THREE.GeometryUtils.center(geometry);

	var mesh = new THREE.Mesh(geometry, new THREE.MeshFaceMaterial([this.tableFrontMaterial, this.tableSideMaterial]));

	mesh.setVisible(false);
	mesh.position.set(this.offset.x, this.offset.y, this.offset.z - 1);

	return mesh;
};

$.Board.prototype.loadCards = function() {
	var cardBackMaterial = Util.createTexturedMaterial('asset/cardback.png', 2);
	var cardSideMaterial = Util.createColoredMaterial(0x808080);

	this.cardObjects = [];

	for (var i = 0; i < this.NUMBER_OF_CARDS; i += 1) {
		var cardFrontMaterial = Util.createTexturedMaterial('asset/memory' + (i % 22) + ".jpg", 1);

		for (var j = 0; j < 2; j += 1) {
			var cardObject = new $.Card(cardFrontMaterial, cardBackMaterial, cardSideMaterial);

			cardObject.setVisible(false);

			this.cardObjects[i * 2 + j] = cardObject;

			$.scene.add(cardObject);
		}
	}
};

$.register("board", new $.Board());