$.BoardController = function() {
	$.Controller.call(this);

	this.view = new $.BoardView(this);
};

$.BoardController.prototype = Object.create($.Controller.prototype);

$.BoardController.prototype.NUMBER_OF_CARDS = 25;

$.BoardController.prototype.load = function() {
	this.view.load();
};

$.BoardController.prototype.activate = function() {
	this.initCardDatas();

	$.WORLD.addView(this.view);
};

$.BoardController.prototype.initCardDatas = function() {
	var cardIndices = [];

	for (var i = 0; i < this.NUMBER_OF_CARDS; i += 1) {
		cardIndices.push(i);
	}

	Util.shuffle(cardIndices);

	this.cardDatas = [];

	for (i = 0; i < this.boardSize.width * this.boardSize.height; i += 2) {
		var cardIndex = cardIndices[parseInt(i / 2, 10)];

		this.cardDatas.push({
			cardIndex: cardIndex,
			objectIndex: cardIndex * 2,
			count: 0
		});
		this.cardDatas.push({
			cardIndex: cardIndex,
			objectIndex: cardIndex * 2 + 1,
			count: 0
		});
	}

	Util.shuffle(this.cardDatas);
};