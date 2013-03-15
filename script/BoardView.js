$.BoardView = function(controller) {
	$.View.call(this, controller);
};

$.BoardView.prototype = Object.create($.View.prototype);

$.BoardView.prototype.load = function() {
	this.boardObject = new THREE.Object3D();

	this.tableFrontMaterial = Util.createTexturedMaterial("asset/table.png", 10);
	this.tableSideMaterial = Util.createColoredMaterial(0xff0000);

	this.loadCards();

	this.boardObject.setVisible(false);

	$.WORLD.addObject(this.boardObject);
};

$.BoardView.prototype.loadCards = function() {
	var cardBackMaterial = Util.createTexturedMaterial('asset/cardback.png', 2);
	var cardSideMaterial = Util.createColoredMaterial(0x808080);

	this.cardObjects = [];

	for (var i = 0; i < this.controller.NUMBER_OF_CARDS; i += 1) {
		var cardFrontMaterial = Util.createTexturedMaterial('asset/memory' + i + ".jpg", 1);

		for (var j = 0; j < 2; j += 1) {
			var cardObject = new $.Card(cardFrontMaterial, cardBackMaterial, cardSideMaterial);
			cardObject.setVisible(false);

			this.cardObjects.push(cardObject);
		}
	}
};

$.BoardView.prototype.activate = function() {
	var self = this;

	var fieldWidth = this.controller.boardSize.width * ($.Card.SIZE + $.Card.SPACING);
	var fieldHeight = this.controller.boardSize.height * ($.Card.SIZE + $.Card.SPACING);

	var tableWidth = (this.controller.boardSize.width + 2) * ($.Card.SIZE + $.Card.SPACING);
	var tableHeight = (this.controller.boardSize.height + 2) * ($.Card.SIZE + $.Card.SPACING);

	this.boardObject.position.set($.WORLD.camera.position.x, $.WORLD.camera.position.y, - $.WORLD.camera.computeDistance(tableWidth, tableHeight));

	this.activateTable(tableWidth, tableHeight);
	this.activateCards();

	this.boardObject.growTween(2000).delay(1000 / $.SPEED).start();

	var delay = 2000;

	for (var y = 0; y < this.controller.boardSize.height; y += 1) {
		for (var x = 0; x < this.controller.boardSize.width; x += 1) {
			var index = x + y * this.controller.boardSize.width;
			var cardObject = this.cardObjects[this.controller.cardDatas[index].objectIndex];
			var position = this.computeCardPosition(x, y);

			cardObject.flyInTween(position).delay(delay / $.SPEED).start();

			delay += 100;

			$.WORLD.addClickable(cardObject.children[0], this, this.onClickCard);
		}
	}

	delay += 2000;

	$.WORLD.camera.locateTween(new THREE.Vector3(this.boardObject.position.x, this.boardObject.position.y, this.boardObject.position.z), Math.PI / 16 * 7, - this.boardObject.position.z, 0,
	1000).onComplete(function() {
		$.WORLD.camera.locateTween(new THREE.Vector3(self.boardObject.position.x, self.boardObject.position.y - fieldHeight * 0.1, self.boardObject.position.z), [-Math.PI / 8 * 3, Math.PI / 8 * 3], $.WORLD.camera.computeDistance(fieldWidth, fieldHeight), Math.PI * 2,
		delay).start();
	}).start();
};

$.BoardView.prototype.activateTable = function(width, height) {
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

	mesh.position.set(0, 0, - 2);
	mesh.setVisible(false);

	this.boardObject.add(mesh);

};

$.BoardView.prototype.activateCards = function() {
	for (var y = 0; y < this.controller.boardSize.height; y += 1) {
		for (var x = 0; x < this.controller.boardSize.width; x += 1) {
			var index = x + y * this.controller.boardSize.width;
			var cardObject = this.cardObjects[this.controller.cardDatas[index].objectIndex];

			cardObject.position = this.computeCardStartPosition(x, y);
			cardObject.rotation.z = (Math.random() - 0.5) * Math.PI / 8;

			this.boardObject.add(cardObject);
		}
	}
};

$.BoardView.prototype.onClickCard = function(mesh) {
	
};

$.BoardView.prototype.computeCardPosition = function(x, y) {
	var index = x + this.controller.boardSize.width * y;
	var ox = ($.Card.SIZE + $.Card.SPACING) * (x - ((this.controller.boardSize.width - 1) / 2));
	var oy = -($.Card.SIZE + $.Card.SPACING) * (y - ((this.controller.boardSize.height - 1) / 2));

	return new THREE.Vector3(ox, oy, $.Card.THICKNESS / 2);
};

$.BoardView.prototype.computeCardStartPosition = function(x, y) {
	var index = x + this.controller.boardSize.width * y;
	var oy = -($.Card.SIZE + $.Card.SPACING) * (this.controller.boardSize.height - ((this.controller.boardSize.height - 1) / 2));

	return new THREE.Vector3(0, oy, $.Card.THICKNESS / 2 + $.Card.THICKNESS * ((this.controller.boardSize.width * this.controller.boardSize.height) - index));
};