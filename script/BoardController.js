$.BoardController = function() {
	$.Controller.call(this);

	this.view = new $.BoardView(this);
};

$.BoardController.prototype = Object.create($.Controller.prototype);

$.BoardController.prototype.NUMBER_OF_CARDS = 25;

$.BoardController.prototype.STATE_NONE = 0;

$.BoardController.prototype.STATE_ONE = 1;

$.BoardController.prototype.STATE_TWO = 2;

$.BoardController.prototype.STATE_COLLECT = 3;

$.BoardController.prototype.STATE_FINISHED = 4;

$.BoardController.prototype.SCORE_PER_COUNT = [50, 50, 50, 25, 15, 10, 5];


$.BoardController.prototype.load = function() {
	this.view.load();
};

$.BoardController.prototype.activate = function() {
	this.state = this.STATE_NONE;
	this.selected = [-1, - 1];
	this.score = 0;
	this.remaining = this.boardSize.width * this.boardSize.height;

	this.initCardDatas();

	$.WORLD.addView(this.view);
	$.WORLD.setClick(this, this.onClick);
};

$.BoardController.prototype.inactivate = function() {
	$.WORLD.removeView(this.view, 250);
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
	if (this.state === this.STATE_TWO) {
		if (this.cardDatas[this.selected[0]].cardId === this.cardDatas[this.selected[1]].cardId) {
			this.onHit();
		} else {
			this.onMiss();
		}

		return true;
	} else if (this.state === this.STATE_COLLECT) {
		this.onStack();

		return true;
	}

	return false;
};

$.BoardController.prototype.onHit = function() {
	for (var i = 0; i < this.selected.length; i += 1) {
		var cardData = this.cardDatas[this.selected[i]];

		cardData.shown = false;
		this.view.collectCard(cardData.objectIndex, i);

		this.score += this.SCORE_PER_COUNT[(cardData.count < this.SCORE_PER_COUNT.length) ? cardData.count : this.SCORE_PER_COUNT.length - 1];
		this.remaining -= 1;
	}

	$.WORLD.playSound("yeah");
	
	this.setState(this.STATE_COLLECT);
};

$.BoardController.prototype.onStack = function() {
	for (var i = 0; i < this.selected.length; i += 1) {
		var cardData = this.cardDatas[this.selected[i]];

		this.view.stackCard(cardData.objectIndex, i);
	}

	if (this.remaining === 0) {
		this.setState(this.STATE_FINISHED);

		var controller = $.MAIN.getController("score");

		controller.score = this.score;
		controller.maxScore = this.SCORE_PER_COUNT[0] * this.boardSize.width * this.boardSize.height;


		$.MAIN.activateController("score");
	} else {
		this.setState(this.STATE_NONE);
	}
};

$.BoardController.prototype.onMiss = function() {
	for (var i = 0; i < this.selected.length; i += 1) {
		var cardData = this.cardDatas[this.selected[i]];

		cardData.shown = false;
		this.view.hideCard(cardData.objectIndex, i);
	}

	this.setState(this.STATE_NONE);
};

$.BoardController.prototype.onCard = function(dataIndex) {
	var cardData = this.cardDatas[dataIndex];

	if (this.state === this.STATE_NONE) {
		if (cardData.shown) {
			return false;
		}

		cardData.shown = true;
		cardData.count += 1;
		this.view.showCard(cardData.objectIndex);
		this.selected[0] = dataIndex;
		this.setState(this.STATE_ONE);

		return true;
	}

	if (this.state === this.STATE_ONE) {
		if (cardData.shown) {
			return false;
		}

		cardData.shown = true;
		cardData.count += 1;
		this.view.showCard(cardData.objectIndex);
		this.selected[1] = dataIndex;
		this.setState(this.STATE_TWO);

		return true;
	}

	return false;
};

$.BoardController.prototype.setState = function(state) {
	this.state = state;
	this.stateTime = this.time;
};

$.BoardController.prototype.animate = function(time, duration) {
	var stateDuration = time - this.stateTime;

	if ((this.state === this.STATE_TWO) && (stateDuration > 2)) {
		this.onClick();
	} else if ((this.state === this.STATE_COLLECT) && (stateDuration > 5)) {
		this.onClick();
	}
};