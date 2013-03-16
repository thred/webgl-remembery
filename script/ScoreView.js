$.ScoreView = function(controller) {
	$.View.call(this, controller);
};

$.ScoreView.prototype = Object.create($.View.prototype);

$.ScoreView.prototype.load = function() {
	var self = this;

	this.viewObject = new THREE.Object3D();

	this.scoreObject = new $.Score();
	this.scoreObject.rotation.x = Math.PI / 2;
	this.scoreObject.startPosition = new THREE.Vector3(0, - 5, - 30);
	this.scoreObject.showPosition = new THREE.Vector3(0, - 5, - 5);

	this.viewObject = new THREE.Object3D();
	this.viewObject.add(this.scoreObject);
	this.viewObject.setVisible(false);

	this.starObjects = [];

	new THREE.JSONLoader().load('asset/star.js', function(geometry) {
		geometry.computeBoundingBox();
		THREE.GeometryUtils.center(geometry);

		var material = Util.createColoredMaterial(0xffdd55);

		for (var i = 0; i < 5; i += 1) {
			var mesh = new THREE.Mesh(geometry, material);

			self.starObjects[i] = new THREE.Object3D();
			self.starObjects[i].add(mesh);
			self.starObjects[i].rotation.x = Math.PI / 2;
			self.starObjects[i].scale.set(1.5, 1.5, 1.5);
			self.starObjects[i].setVisible(false);

			self.viewObject.add(self.starObjects[i]);
		}
	});

	this.playButtonObject = new $.Button('asset/play.png', 0x6f916f);
	this.playButtonObject.scale.set(5, 5, 5);
	this.playButtonObject.startPosition = new THREE.Vector3(100, - 10, - 9);
	this.playButtonObject.showPosition = new THREE.Vector3(0, - 10, - 9);
	this.playButtonObject.setVisible(false);
	this.viewObject.add(this.playButtonObject);

	$.WORLD.addObject(this.viewObject);
};

$.ScoreView.prototype.activate = function() {
	var position = $.MAIN.getController("board").view.boardObject.position.clone();

	position.y += position.z * 2;
	position.z = 0;

	this.viewObject.position = position;
	this.scoreObject.score(0, this.controller.maxScore);
	this.scoreObject.position = this.scoreObject.startPosition;
	this.scoreObject.moveTween(this.scoreObject.startPosition, this.scoreObject.showPosition, 1000).delay(2000 / $.SPEED).start();

	this.viewObject.visible = true;

	$.WORLD.camera.locateTween(position, 0, $.WORLD.camera.computeDistance(60, 30), Math.PI * 2,
	2000).start();
};

$.ScoreView.prototype.animate = function(time, duration) {
	for (var i = 0; i < this.starObjects.length; i += 1) {
		this.starObjects[i].children[0].animateDancing(time, i, 2);
	}

	this.scoreObject.children[0].animateDancing(time, 0, 2, 0.2);
	this.playButtonObject.children[0].animateDancing(time, 4, 0.4);
};

$.ScoreView.prototype.showStars = function(count) {
	var delay = 0;

	for (var i = 0; i < count; i += 1) {
		var starObject = this.starObjects[i];

		starObject.position.set((-count / 2 + i) * 10 + 5, 0, 5);
		starObject.growTween(1000).delay(delay / $.SPEED).start();

		delay += 500;
	}

	this.playButtonObject.bounceInTween(this.playButtonObject.startPosition, this.playButtonObject.showPosition,
	3000).delay(delay / $.SPEED).start();

	$.WORLD.addClickable(this.playButtonObject.children[0], this, this.onPlayButtonClick);
};

$.ScoreView.prototype.onPlayButtonClick = function(mesh) {
	$.WORLD.removeClickable(mesh);

	this.playButtonObject.blowTween().start();
	this.scoreObject.blowTween().delay(500 / $.SPEED).start();

	for (var i = 0; i < this.starObjects.length; i += 1) {
		if (this.starObjects[i].visible) {
			this.starObjects[i].blowTween(5).delay(575 / $.SPEED + i * 75 / $.SPEED).start();
			$.WORLD.removeClickable(this.starObjects[i].children[0]);
		}
	}
	
	this.controller.onPlay();
};