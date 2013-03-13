$.Intro = function() {
	this.LETTERS = [{
		letter: "R",
		color: 0xaa0000,
		x: -36.75
	}, {
		letter: "E",
		color: 0xaa4400,
		x: 9 - 36.75
	}, {
		letter: "M",
		color: 0xaa8800,
		x: 18 - 36.75
	}, {
		letter: "E",
		color: 0x668000,
		x: 27.5 - 36.75
	}, {
		letter: "M",
		color: 0x217821,
		x: 36.5 - 36.75
	}, {
		letter: "B",
		color: 0x2ca089,
		x: 46.5 - 36.75
	}, {
		letter: "E",
		color: 0x0044aa,
		x: 55 - 36.75
	}, {
		letter: "R",
		color: 0x4400aa,
		x: 64 - 36.75
	}, {
		letter: "Y",
		color: 0xd400aa,
		x: 73.5 - 36.75
	}];

	this.letterObjects = [];
};

$.Intro.prototype.activate = function() {
	$.camera.locate(new THREE.Vector3(0, 0, 0), 0, $.camera.computeDistance(80, 40), 0);

	for (var i = 0; i < this.letterObjects.length; i += 1) {
		this.letterObjects[i].bounceInTween(this.letterObjects[i].startPosition, this.letterObjects[i].showPosition,
		3000 * $.SPEED).delay(i * 100 * $.SPEED).start();

		$.addClickable(this.letterObjects[i].children[0], this, this.blow);
	}

	this.playButtonObject.bounceInTween(this.playButtonObject.startPosition, this.playButtonObject.showPosition,
	3000 * $.SPEED).delay(1000 * $.SPEED).start();

	$.addClickable(this.playButtonObject.children[0], this, this.next);
};

$.Intro.prototype.inactivate = function() {

};

$.Intro.prototype.blow = function(mesh) {
	$.removeClickable(mesh);
	mesh.parent.blowTween().start();
};

$.Intro.prototype.next = function() {
	$.removeClickable(this.playButtonObject.children[0]);
	this.playButtonObject.blowTween().start();

	for (var i = 0; i < this.letterObjects.length; i += 1) {
		if (this.letterObjects[i].visible) {
			this.letterObjects[i].blowTween(5).delay(500 * $.SPEED + i * 75 * $.SPEED).start();
			$.removeClickable(this.letterObjects[i].children[0]);
		}
	}

	Util.schedule(function() {
		$.activate("size");
	}, 250 * $.SPEED);
};

$.Intro.prototype.animate = function(time) {
	for (var i = 0; i < this.letterObjects.length; i += 1) {
		this.letterObjects[i].children[0].animateDancing(time, i, 2);
	}

	this.playButtonObject.children[0].animateDancing(time, 0, 0.2);
};

$.Intro.prototype.load = function() {
	this.letterObjects = [];

	for (var i = 0; i < this.LETTERS.length; i += 1) {
		this.letterObjects[i] = this.loadLetter(this.LETTERS[i]);
		this.letterObjects[i].setVisible(false);
		$.scene.add(this.letterObjects[i]);
	}

	this.playButtonObject = new $.Button('asset/play.png', 0x6f916f);
	this.playButtonObject.scale.set(20, 20, 20);
	this.playButtonObject.startPosition = new THREE.Vector3(100, - 10, - 7);
	this.playButtonObject.showPosition = new THREE.Vector3(0, - 10, - 7);
	this.playButtonObject.setVisible(false);
	$.scene.add(this.playButtonObject);
};

$.Intro.prototype.loadLetter = function(letter) {
	var textGeo = new THREE.TextGeometry(letter.letter, {
		size: 10,
		height: 4,
		curveSegments: 2,

		font: "foo",
		weight: "normal",
		style: "normal",

		bevelThickness: 0.1,
		bevelSize: 0.1,
		bevelEnabled: true

	});

	textGeo.computeBoundingBox();
	THREE.GeometryUtils.center(textGeo);
	textGeo.computeFaceNormals();
	textGeo.computeVertexNormals();

	var textMaterial = new THREE.MeshPhongMaterial({
		color: letter.color,
		specular: 0xffffff,
		ambient: 0xaaccff
	});

	var mesh = new THREE.Mesh(textGeo, textMaterial);
	var obj = new THREE.Object3D();

	obj.add(mesh);
	obj.startPosition = new THREE.Vector3(letter.x + 100, 0, 7);
	obj.showPosition = new THREE.Vector3(letter.x, 0, 7);
	obj.rotation.set(Math.PI / 2, 0, 0);

	return obj;
};

$.register("intro", new $.Intro());