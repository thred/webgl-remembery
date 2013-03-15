$.BoardController = function() {
	$.Controller.call(this);

	this.view = new $.BoardView(this);
};

$.BoardController.prototype = Object.create($.Controller.prototype);

$.BoardController.prototype.NUMBER_OF_CARDS = 25;

$.BoardController.prototype.STATE_NONE = 0;

$.BoardController.prototype.STATE_ONE = 1;

$.BoardController.prototype.STATE_TWO = 2;

$.BoardController.prototype.load = function() {
	this.view.load();
};

$.BoardController.prototype.activate = function() {
	this.state = this.STATE_NONE;
	this.selected = [-1, - 1];

	this.initCardDatas();

	$.WORLD.addView(this.view);
	$.WORLD.setClick(this, this.onClick);
};

$.BoardController.prototype.initCardDatas = function() {
	var cardIds = [];

	for (var i = 0; i < this.NUMBER_OF_CARDS; i += 1) {
		cardIds.push(i);
	}

	Util.shuffle(cardIds);

	this.cardDatas = [];

	for (i = 0; i < this.boardSize.width * this.boardSize.height; i += 2) {
		var cardId = cardIds[parseInt(i / 2, 10)];

		this.cardDatas.push({
			cardId: cardId,
			objectIndex: cardId * 2,
			shown: false,
			count: 0
		});
		this.cardDatas.push({
			cardId: cardId,
			objectIndex: cardId * 2 + 1,
			shown: false,
			count: 0
		});
	}

	Util.shuffle(this.cardDatas);
};

$.BoardController.prototype.onClick = function() {
	if (this.state !== this.STATE_TWO) {
		return false;
	}

	if (this.cardDatas[this.selected[0]].cardId === this.cardDatas[this.selected[1]].cardId) {
		this.onHit();
	} else {
		this.onMiss();
	}

	return true;
};

$.BoardController.prototype.onHit = function() {};

$.BoardController.prototype.onMiss = function() {
	for (var i = 0; i < this.selected.length; i += 1) {
		var cardData = this.cardDatas[this.selected[i]];

		if (!cardData.shown) {
			continue;
		}

		cardData.shown = false;
		this.view.hideCard(cardData.objectIndex);
	}

	this.state = this.STATE_NONE;
};

$.BoardController.prototype.onCard = function(dataIndex) {
	var cardData = this.cardDatas[dataIndex];

	if (this.state === this.STATE_NONE) {
		if (cardData.shown) {
			return false;
		}

		cardData.shown = true;
		this.view.showCard(cardData.objectIndex);
		this.state = this.STATE_ONE;
		this.selected[0] = dataIndex;

		return true;
	}

	if (this.state === this.STATE_ONE) {
		if (cardData.shown) {
			return false;
		}

		cardData.shown = true;
		this.view.showCard(cardData.objectIndex);
		this.state = this.STATE_TWO;
		this.selected[1] = dataIndex;

		return true;
	}

	return false;
};