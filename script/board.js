$.Board = function() {
	this.controller = new $.Controller(this);
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

	this.boardObject.position.set($.camera.position.x, $.camera.position.y, - $.camera.computeDistance(tableWidth, tableHeight));
	this.tableObject = this.createTableObject(tableWidth, tableHeight);
	this.tableObject.setVisible(false);
	this.boardObject.add(this.tableObject);

	this.initCardDatas();

	this.boardObject.growTween(2000 * $.SPEED).delay(1000 * $.SPEED).start();

	var delay = 2000 * $.SPEED;
	/*
	for (var y = this.boardSize.height - 1; y >= 0; y -= 1) {
		for (var x = this.boardSize.width - 1; x >= 0; x -= 1) {
			var i = x + y * this.boardSize.width;
			var cardObject = this.cardObjects[this.cardDatas[i].objectIndex];

			cardObject.growTween(1000 * $.SPEED).delay(delay).start();

			delay += 50 * $.SPEED;
		}
	}
	*/

	delay += 100 * $.SPEED;

	for (var y = 0; y < this.boardSize.height; y += 1) {
		for (var x = 0; x < this.boardSize.width; x += 1) {
			var i = x + y * this.boardSize.width;
			var cardObject = this.cardObjects[this.cardDatas[i].objectIndex];
			var position = this.computeCardPosition(x, y);

			cardObject.flyInTween(position).delay(delay + 1000 * $.SPEED).start();

			delay += 100 * $.SPEED;

			$.addClickable(cardObject.children[0], this.controller, this.controller.onClickCard);
		}
	}

	delay += 2000 * $.SPEED;

	$.camera.locateTween(new THREE.Vector3(this.boardObject.position.x, this.boardObject.position.y, this.boardObject.position.z), Math.PI / 16 * 7, - this.boardObject.position.z, 0,
	1000 * $.SPEED).onComplete(function() {
		$.camera.locateTween(new THREE.Vector3(self.boardObject.position.x, self.boardObject.position.y - fieldHeight * 0.1, self.boardObject.position.z), [-Math.PI / 8 * 3, Math.PI / 8 * 3], $.camera.computeDistance(fieldWidth, fieldHeight), Math.PI * 2,
		delay).start();
	}).start();
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

