$.Size = function() {
	this.BUTTONS = [{
		texture: 'asset/xsmall.png',
		color: 0xcc00ff,
		width: 2,
		height: 1
	}, {
		texture: 'asset/small.png',
		color: 0x4400aa,
		width: 6,
		height: 3
	}, {
		texture: 'asset/medium.png',
		color: 0x2ca05a,
		width: 6,
		height: 4
	}, {
		texture: 'asset/large.png',
		color: 0xd45500,
		width: 6,
		height: 6
	}, {
		texture: 'asset/xlarge.png',
		color: 0x782121,
		width: 8,
		height: 6
	}];

	this.buttonObjects = [];

};

$.Size.prototype.activate = function() {
	$.camera.locateTween(new THREE.Vector3(0, 0, 0), 0, $.camera.computeDistance(100, 30), 0,
	2000).start();

	for (var i = 0; i < this.buttonObjects.length; i += 1) {
		this.buttonObjects[i].bounceInTween(this.buttonObjects[i].startPosition, this.buttonObjects[i].showPosition,
		3000 * $.SPEED).delay(i * 100 * $.SPEED).start();

		$.addClickable(this.buttonObjects[i].children[0], this, this.next);
	}
};

$.Size.prototype.inactivate = function() {

};

$.Size.prototype.next = function(mesh) {
	$.removeClickable(mesh);
	mesh.parent.blowTween().start();

	for (var i = 0; i < this.buttonObjects.length; i += 1) {
		if (this.buttonObjects[i].visible) {
			this.buttonObjects[i].blowTween(5).delay(500 * $.SPEED + i * 75 * $.SPEED).start();
			$.removeClickable(this.buttonObjects[i].children[0]);
		}
	}

	$.get("board").setBoardSize(mesh.parent.data.width, mesh.parent.data.height);

	Util.schedule(function() {
		$.activate("board");
	}, 250 * $.SPEED);
};

$.Size.prototype.animate = function(time) {
	for (var i = 0; i < this.buttonObjects.length; i += 1) {
		this.buttonObjects[i].children[0].animateDancing(time, i, 0.15);
	}
};

$.Size.prototype.load = function() {
	for (var i = 0; i < this.BUTTONS.length; i += 1) {
		this.buttonObjects[i] = this.loadButton(this.BUTTONS[i], i);
		this.buttonObjects[i].data = this.BUTTONS[i];
		$.scene.add(this.buttonObjects[i]);
	}
};

$.Size.prototype.loadButton = function(button, index) {
	var object = new $.Button(button.texture, button.color);
	var x = (index - 2) * 20;

	object.setVisible(false);
	object.scale.set(15, 15, 15);
	object.startPosition = new THREE.Vector3(100 + x, - 5, 0);
	object.showPosition = new THREE.Vector3(x, - 5, 0);

	return object;
};

$.register("size", new $.Size());