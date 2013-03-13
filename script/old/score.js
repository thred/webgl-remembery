var Score = Score || {
	pointsWidth : 33,
	pointsHeight : 9,
	pointsThickness : 0.8,
	pointsCanvasWidth : 550,
	pointsCanvasHeight : 150,

	digitImages : []
}

Score.activate = function() {
	// var position = Memory.camera.position.clone();
	// var length = position.length();

	Score.pointsMesh.position = new THREE.Vector3(0, -Score.pointsHeight, Score.pointsHeight);
	Score.pointsMesh.rotation.x += Math.PI / 4;
	Score.pointsMesh.scale.set(0, 0, 0);
	Score.pointsMesh.visible = true;

	Memory.tweenCameraTo(Score.pointsMesh.position, new THREE.Vector3(0, -1, 1), Score.pointsWidth * 1.25,
			Score.pointsHeight * 1.25, 2000 * Memory.SPEED).start();

	// position.normalize().setLength(length / 2);
	//
	// Score.pointsMesh.position = position;
	// Score.pointsMesh.lookAt(Memory.camera.position);
	// Score.pointsMesh.rotation.x += Math.PI;
	// Score.pointsMesh.visible = true;
	//
	Score.render(0, 0);

	Score.showScoreTween().delay(1000 * Memory.SPEED).onComplete(function() {
		Score.countScoreTween().start();
	}).start();
}

Score.showScoreTween = function() {
	var from = {
		rotation : 0,
		scale : 0
	}
	var to = {
		rotation : Math.PI / 2,
		scale : 1
	}
	var update = function() {
		Score.pointsMesh.rotation.x = Math.sin(this.rotation) * (Math.PI * 25 + Math.PI / 4);
		Score.pointsMesh.scale.x = this.scale;
		Score.pointsMesh.scale.y = this.scale;
		Score.pointsMesh.scale.z = this.scale;
	}
	return new TWEEN.Tween(from).to(to, 2000 * Memory.SPEED).onUpdate(update);
}

Score.countScoreTween = function() {
	var from = {
		value : 0,
		maxValue : 0
	}
	var to = {
		value : Score.points,
		maxValue : Score.maxPoints
	}
	var update = function() {
		Score.render(Math.round(this.value), Math.round(this.maxValue));
	}
	return new TWEEN.Tween(from).to(to, 3000 * Memory.SPEED).onUpdate(update);
}

Score.load = function() {
	Score.canvas = document.createElement('canvas');
	Score.canvas.width = Score.pointsCanvasWidth;
	Score.canvas.height = Score.pointsCanvasHeight;

	Score.context = Score.canvas.getContext('2d');

	for ( var i = 0; i < 10; i += 1) {
		var image = new Image();
		image.onload = function() {

		}
		image.src = 'asset/digit' + i + '.png';

		Score.digitImages[i] = image;
	}

	Score.slashImage = new Image();
	Score.slashImage.onload = function() {

	}
	Score.slashImage.src = 'asset/slash.png';

	Score.pointsTexture = new THREE.Texture(Score.canvas);
	Score.pointsTexture.needsUpdate = true;

	var pointsGeometry = Score.createPointsGeometry();
	var pointsFrontMaterial = new THREE.MeshPhongMaterial({
		map : Score.pointsTexture
	});
	var pointsSideMaterial = Util.createColoredMaterial('#ff0000');

	Score.pointsMesh = Score.createPointsMesh(pointsGeometry, pointsFrontMaterial, pointsSideMaterial);
	Score.pointsMesh.visible = false;
	Score.pointsMesh.rotation.x = Math.PI;

	Memory.scene.add(Score.pointsMesh);
}

Score.render = function(points, maxPoints) {
	var s = points + '/' + maxPoints;
	var x = Score.pointsCanvasWidth / 2 - s.length * 54 / 2;
	var y = (Score.pointsCanvasHeight - 64) / 2;

	Score.context.fillStyle = '#ffeeaa';
	Score.context.fillRect(0, 0, Score.pointsCanvasWidth, Score.pointsCanvasHeight);

	for ( var i = 0; i < s.length; i += 1) {
		var ch = s.charCodeAt(i);

		if ((ch >= 48) && (ch <= 57)) {
			Score.context.drawImage(Score.digitImages[ch - 48], x, y);
		} else if (ch == 47) {
			Score.context.drawImage(Score.slashImage, x, y);
		}

		x += 54;
	}

	Score.pointsTexture.needsUpdate = true;
}

Score.createPointsGeometry = function() {
	var radius = Score.pointsHeight / 2;
	var width = Score.pointsWidth / 2 - radius;
	var shape = new THREE.Shape();

	shape.moveTo(-width, radius);
	shape.lineTo(width, radius);
	shape.quadraticCurveTo(width + radius, radius, width + radius, 0);
	shape.quadraticCurveTo(width + radius, -radius, width, -radius);
	shape.lineTo(-width, -radius);
	shape.quadraticCurveTo(-width - radius, -radius, -width - radius, 0);
	shape.quadraticCurveTo(-width - radius, radius, -width, radius);

	return new THREE.ExtrudeGeometry(shape, {
		amount : Score.pointsThickness,
		bevelSegments : 2,
		steps : 2,
		bevelSize : Score.pointsThickness,
		bevelThickness : Score.pointsThickness,
		material : 0,
		extrudeMaterial : 1,
		UVGenerator : Util.UVGenerator
	});
}

Score.createPointsMesh = function(geometry, frontMaterial, sideMaterial) {
	return new THREE.Mesh(geometry, new THREE.MeshFaceMaterial([ frontMaterial, sideMaterial ]));
}
