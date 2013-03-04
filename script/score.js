var Score = Score || {
	pointsWidth : 33,
	pointsHeight : 9,
	pointsThickness : 0.8,
	pointsCanvasWidth : 550,
	pointsCanvasHeight : 150,

	digitImages : []
}

Score.activate = function() {
	var position = Memory.camera.position.clone();
	var length = position.length();

	position.normalize().setLength(length / 2);

	Score.pointsMesh.position = position;
	Score.pointsMesh.lookAt(Memory.camera.position);
	Score.pointsMesh.rotation.x += Math.PI;
	Score.pointsMesh.visible = true;

	Score.render(Score.points, Score.maxPoints);
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
