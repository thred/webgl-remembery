/**
 * Copyright 2013 Manfred Hantschel
 * 
 * This file is part of WebGL-Remembery.
 * 
 * WebGL-Remembery is free software: you can redistribute it and/or modify
 * it under the terms of the GNU General Public License as published by
 * the Free Software Foundation, either version 3 of the License, or
 * (at your option) any later version.
 * 
 * WebGL-Remembery is distributed in the hope that it will be useful,
 * but WITHOUT ANY WARRANTY; without even the implied warranty of
 * MERCHANTABILITY or FITNESS FOR A PARTICULAR PURPOSE. See the
 * GNU General Public License for more details.
 * 
 * You should have received a copy of the GNU General Public License
 * along with WebGL-Remembery. If not, see <http://www.gnu.org/licenses/>.
 */

$.BoardView = function(controller) {
	$.View.call(this, controller);
};

$.BoardView.prototype = Object.create($.View.prototype);

$.BoardView.prototype.load = function(loadingMonitor) {
	this.boardObject = new THREE.Object3D();

	this.tableFrontMaterial = Util.createTexturedMaterial("asset/table.png", loadingMonitor, 10);
	this.tableSideMaterial = Util.createColoredMaterial(0xff0000);

	this.loadCards(loadingMonitor);

	this.boardObject.setVisible(false);

	$.WORLD.addObject(this.boardObject);
};

$.BoardView.prototype.loadCards = function(loadingMonitor) {
	var cardBackMaterial = Util.createTexturedMaterial('asset/cardback.png', loadingMonitor, 2);
	var cardSideMaterial = Util.createColoredMaterial(0x808080);

	this.cardObjects = [];

	for (var i = 0; i < this.controller.NUMBER_OF_CARDS; i += 1) {
		var cardFrontMaterial = Util.createTexturedMaterial('asset/memory' + i + ".jpg", loadingMonitor, 1);

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
	var geometry = new $.ExtrudeGeometry(Util.createRoundedRectangleShape(width, height, 6), {
		amount: 2,
		bevelSegments: ($.HI) ? 2 : 0,
		steps: ($.HI) ? 2 : 1,
		bevelSize: ($.HI) ? 1 : 0, 
		bevelThickness: ($.HI) ? 1 : 0,
		material: 0,
		extrudeMaterial: 1
	});

	if ($.HI) {
		geometry.computeFaceNormals();
		geometry.computeVertexNormals();
		geometry.computeTangents();
	}
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

$.BoardView.prototype.hideCard = function(index, offset) {
	this.cardObjects[index].hideTween().delay(offset * 100 / $.SPEED).start();
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