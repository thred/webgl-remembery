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

	this.boardObject.position.set(0, - 7, - $.WORLD.camera.computeDistance(fieldWidth, fieldHeight));

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

	this.stackSize = 0;
};

$.BoardView.prototype.inactivate = function() {
	this.boardObject.shrinkTween(250).start();

	$.MAIN.schedule(this, function() {
		this.boardObject.remove(this.tableObject);

		for (var i = 0; i < this.cardObjects.length; i += 1) {
			this.boardObject.remove(this.cardObjects[i]);
			this.cardObjects[i].reset();
		}
	}, 250);
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

	this.tableObject = new THREE.Mesh(geometry, new THREE.MeshFaceMaterial([this.tableFrontMaterial, this.tableSideMaterial]));

	this.tableObject.position.set(0, 0, - 2);
	this.tableObject.setVisible(false);

	this.boardObject.add(this.tableObject);

};

$.BoardView.prototype.activateCards = function() {
	for (var y = 0; y < this.controller.boardSize.height; y += 1) {
		for (var x = 0; x < this.controller.boardSize.width; x += 1) {
			var index = x + y * this.controller.boardSize.width;
			var cardObject = this.cardObjects[this.controller.cardDatas[index].objectIndex];

			cardObject.position = this.computeCardStartPosition(x, y);
			cardObject.rotation.z = (Math.random() - 0.5) * Math.PI / 8;
			cardObject.index = index;

			this.boardObject.add(cardObject);
		}
	}
};

$.BoardView.prototype.onClickCard = function(mesh) {
	this.controller.onCard(mesh.parent.index);
};

$.BoardView.prototype.showCard = function(index) {
	this.cardObjects[index].showTween().start();
};

$.BoardView.prototype.hideCard = function(index) {
	this.cardObjects[index].hideTween().start();
};

$.BoardView.prototype.collectCard = function(index, offset) {
	var directionX = Math.cos($.WORLD.camera.direction);
	var directionY = Math.sin($.WORLD.camera.direction);
	var vector = new THREE.Vector3(Math.sin($.WORLD.camera.theta + Math.PI) * directionX, Math.cos($.WORLD.camera.theta + Math.PI) * directionX, directionY).setLength($.WORLD.camera.distance / 2);
	var position = new THREE.Vector3($.WORLD.camera.lookingAt.x + vector.x, $.WORLD.camera.lookingAt.y + vector.y, $.WORLD.camera.lookingAt.z + vector.z);

	position.sub(this.boardObject.position);

	var x = -0.5 + offset;

	position.x += x * ($.Card.SIZE + $.Card.SPACING);

	this.cardObjects[index].collectTween(position).start();
	$.WORLD.removeClickable(this.cardObjects[index].children[0]);
};

$.BoardView.prototype.stackCard = function(index, offset) {
	var position = this.computeCardStackPosition(this.controller.boardSize.width, 1, this.stackSize);

	this.cardObjects[index].stackTween(position).start();
	this.stackSize += 1;
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

	return new THREE.Vector3(0, oy, $.Card.THICKNESS * ((this.controller.boardSize.width * this.controller.boardSize.height) - index));
};

$.BoardView.prototype.computeCardStackPosition = function(x, y, stackSize) {
	var index = x + this.controller.boardSize.width * y;
	var ox = ($.Card.SIZE + $.Card.SPACING) * (x - ((this.controller.boardSize.width - 1) / 2));
	var oy = -($.Card.SIZE + $.Card.SPACING) * (y - ((this.controller.boardSize.height - 1) / 2));

	return new THREE.Vector3(ox, oy, $.Card.THICKNESS * stackSize);
};