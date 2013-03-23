$.Score = function(loadingMonitor) {
	THREE.Object3D.call(this);

	this.canvas = document.createElement('canvas');
	this.canvas.width = this.CANVAS_WIDTH;
	this.canvas.height = this.CANVAS_HEIGHT;

	this.context = this.canvas.getContext('2d');

	this.digitImages = [];
	
	var onLoad = function() {
		
	};

	for (var i = 0; i < 10; i += 1) {
		var image = new Image();

		image.src = 'asset/digit' + i + '.png';

		this.digitImages[i] = image;
		
		loadingMonitor.add(this.digitImages[i]);
	}

	this.slashImage = new Image();
	this.slashImage.src = 'asset/slash.png';

	loadingMonitor.add(this.slashImage);

	this.scoreTexture = new THREE.Texture(this.canvas);
	this.scoreTexture.needsUpdate = true;

	var geometry = this.createGeometry();
	var frontMaterial = new THREE.MeshPhongMaterial({
		map: this.scoreTexture,
		specular: 0xffffff,
		ambient: 0xaaccff
	});
	var sideMaterial = Util.createColoredMaterial(0xffeeaa);

	var mesh = new THREE.Mesh(geometry, new THREE.MeshFaceMaterial([frontMaterial, sideMaterial]));

	this.add(mesh);
};

$.Score.prototype = Object.create(THREE.Object3D.prototype);

$.Score.prototype.CANVAS_WIDTH = 550;

$.Score.prototype.CANVAS_HEIGHT = 100;

$.Score.prototype.createGeometry = function() {
	if ($.Score.uniqueGeometry) {
		return $.Score.uniqueGeometry;
	}

	var shape = Util.createRoundedRectangleShape(33, 6, 3);
	var geometry = new $.ExtrudeGeometry(shape, {
		amount: 0.8,
		bevelSegments: ($.HI) ? 2 : 0,
		steps: ($.HI) ? 2 : 1,
		bevelSize: ($.HI) ? 0.08 : 0,
		bevelThickness: ($.HI) ? 0.08 : 0,
		material: 0,
		backMaterial: 1,
		extrudeMaterial: 1
	});

	if ($.HI) {
		geometry.computeFaceNormals();
		geometry.computeVertexNormals();
		geometry.computeTangents();
	}
	geometry.computeBoundingBox();
	THREE.GeometryUtils.center(geometry);

	return $.Score.uniqueGeometry = geometry;
};

$.Score.prototype.score = function(score, maxScore) {
	var s = score + '/' + maxScore;
	var x = this.CANVAS_WIDTH / 2 - s.length * 54 / 2;
	var y = (this.CANVAS_HEIGHT - 64) / 2;

	this.context.fillStyle = '#ffeeaa';
	this.context.fillRect(0, 0, this.CANVAS_WIDTH, this.CANVAS_HEIGHT);

	for (var i = 0; i < s.length; i += 1) {
		var ch = s.charCodeAt(i);

		if ((ch >= 48) && (ch <= 57)) {
			this.context.drawImage(this.digitImages[ch - 48], x, y);
		} else if (ch == 47) {
			this.context.drawImage(this.slashImage, x, y);
		}

		x += 54;
	}

	this.scoreTexture.needsUpdate = true;
};