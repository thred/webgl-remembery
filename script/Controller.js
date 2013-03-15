$.Controller = function() {
	this.NUMBER_OF_CARDS = 25;
};

$.Controller.prototype.load = function() {};

$.Controller.prototype.activate = function() {};

$.Controller.prototype.inactivate = function() {};





/*
$.Controller.prototype.initialize = function(loadingMonitor) {
	this.introView.load(loadingMonitor);

	
	
	
	
};

$.Controller.prototype.activateBoard = function() {

};


$.Controller.prototype.onClickCard = function(object) {



	object.parent.showTween().start();



};

$.Controller.prototype.initCardDatas = function() {
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
*/