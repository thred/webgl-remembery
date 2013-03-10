$.Board = function() {
	this.NUMBER_OF_CARDS = 25;
}

$.Board.prototype.setBoardSize = function(boardWidth, boardHeight) {
	this.boardSize = {
		width : boardWidth,
		height : boardHeight
	};
}
$.Board.prototype.activate = function() {
	this.initCardDatas();

	$.camera.locateTween(new THREE.Vector3(0, 0, 0), new THREE.Vector2(1, 1), $.camera.computeDistance(60, 60), 0,
			2000).start();

	this.tableObject.growTween(2000 * $.SPEED).delay(1000 * $.SPEED).start();

	// //////// //

	for ( var y = 0; y < this.boardSize.height; y += 1) {
		for ( var x = 0; x < this.boardSize.width; x += 1) {
			var i = x + y * this.boardSize.width;
			var cardObject = this.cardObjects[this.cardDatas[i].objectIndex];

			cardObject.position = this.computeCardStartPosition(x, y);
			cardObject.setVisible(true);
		}
	}
}

$.Board.prototype.animate = function(time) {
}

$.Board.prototype.initCardDatas = function() {
	var cardIndices = [];

	for ( var i = 0; i < this.NUMBER_OF_CARDS; i += 1) {
		cardIndices.push(i);
	}

	Util.shuffle(cardIndices);

	this.cardDatas = [];

	for ( var i = 0; i < this.boardSize.width * this.boardSize.height; i += 2) {
		var cardIndex = cardIndices[parseInt(i / 2)];

		this.cardDatas.push({
			cardIndex : cardIndex,
			objectIndex : cardIndex * 2,
			shown : false,
			count : 0
		});
		this.cardDatas.push({
			cardIndex : cardIndex,
			objectIndex : cardIndex * 2 + 1,
			shown : false,
			count : 0
		});
	}

	Util.shuffle(this.cardDatas);
}

$.Board.prototype.computeCardPosition = function(x, y) {
	var index = x + this.boardSize.width * y;
	var ox = ($.CARD_SIZE + $.CARD_SPACING) * (x - ((this.boardSize.width - 1) / 2));
	var oy = -($.CARD_SIZE + $.CARD_SPACING) * (y - ((this.boardSize.height - 1) / 2));

	return new THREE.Vector3(ox, oy, $.CARD_THICKNESS / 2);
}

$.Board.prototype.computeCardStartPosition = function(x, y) {
	var index = x + this.boardSize.width * y;
	var oy = -($.CARD_SIZE + $.CARD_SPACING) * (this.boardSize.height - ((this.boardSize.height - 1) / 2));

	return new THREE.Vector3(0, oy, $.CARD_THICKNESS / 2 + $.CARD_THICKNESS
			* ((this.boardSize.width * this.boardSize.height) - index));
}

$.Board.prototype.load = function() {
	this.tableObject = this.loadTable();
	$.scene.add(this.tableObject);

	this.loadCards();
}

$.Board.prototype.loadTable = function() {
	var frontMaterial = Util.createTexturedMaterial("asset/table.png", 10);
	var sideMaterial = Util.createColoredMaterial(0xff0000);
	var geometry = new THREE.ExtrudeGeometry(Util.createRoundedRectangleShape(120, 120, 6), {
		amount : 2,
		bevelSegments : 2,
		steps : 2,
		bevelSize : 1,
		bevelThickness : 1,
		material : 0,
		extrudeMaterial : 1
	});

	geometry.computeFaceNormals();
	geometry.computeVertexNormals();
	geometry.computeTangents();
	geometry.computeBoundingBox();
	THREE.GeometryUtils.center(geometry);

	var mesh = new THREE.Mesh(geometry, new THREE.MeshFaceMaterial([ frontMaterial, sideMaterial ]));

	mesh.setVisible(false);
	mesh.position.z = -1;

	return mesh;
}

$.Board.prototype.loadCards = function() {
	var cardBackMaterial = Util.createTexturedMaterial('asset/cardback.png', 2);
	var cardSideMaterial = Util.createColoredMaterial(0x808080);

	this.cardObjects = [];

	for ( var i = 0; i < this.NUMBER_OF_CARDS; i += 1) {
		var cardFrontMaterial = Util.createTexturedMaterial('asset/memory' + (i % 22) + ".jpg", 1);

		for ( var j = 0; j < 2; j += 1) {
			var cardObject = new $.Card(cardFrontMaterial, cardBackMaterial, cardSideMaterial);

			cardObject.setVisible(false);

			this.cardObjects[i * 2 + j] = cardObject;

			$.scene.add(cardObject);
		}
	}
}

$.register("board", new $.Board());
