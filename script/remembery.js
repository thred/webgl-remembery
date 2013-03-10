var $ = $ || {
	SPEED : 1,

	pages : {},
	clickableMeshes : [],
	projector : new THREE.Projector(),
	block : 0
};

$.init = function() {
	$.windowSize = {
		width : window.innerWidth,
		height : window.innerHeight
	}

	$.fov = 50;

	$.scene = new THREE.Scene();

	$.initLight();
	$.initCamera();
	$.initRenderer();

	document.addEventListener('mousedown', $.onDocumentMouseDown, false);
	document.addEventListener('mousemove', $.onDocumentMouseMove, false);
	window.addEventListener('resize', $.onWindowResize, false);

	$.load();
	// Memory.toState(Memory.STATE_LOAD);
}

$.initLight = function() {
	$.scene.add(new THREE.AmbientLight(0x222222));

	var light = new THREE.DirectionalLight(0xfffff0, 0.5);
	light.position.set(0.5, -1, 1).normalize();
	$.scene.add(light);

	light = new THREE.DirectionalLight(0xfffff0, 1.0);
	light.position.set(-0.5, -1, 1).normalize();
	$.scene.add(light);
}

$.initCamera = function() {
	$.camera = new THREE.PerspectiveCamera(this.fov, window.innerWidth / window.innerHeight, 1, 1000);

	$.camera.position.set(0, 0, 0);
	$.camera.up.set(0, 0, 1);

	$.scene.add($.camera);
}

$.initRenderer = function() {
	if (Detector.webgl) {
		var renderer = $.renderer = new THREE.WebGLRenderer({
			antialias : true,
			preserveDrawingBuffer : true
		});

		renderer.setSize(window.innerWidth, window.innerHeight);
		document.body.appendChild(renderer.domElement);
	} else {
		Detector.addGetWebGLMessage();
	}
}

$.animate = function(time) {
	if ($.activePage) {
		$.activePage.animate(time);
	}

	$.firework.animate(time);
	// if (Memory.nextState > Memory.STATE_NONE) {
	// Memory.state = Memory.nextState;
	// Memory.nextState = Memory.STATE_NONE;
	//
	// switch (Memory.state) {
	// case Memory.STATE_LOAD:
	// Memory.load();
	// break;
	//
	// case Memory.STATE_INTRO:
	// Intro.activate();
	// break;
	//
	// case Memory.STATE_MENU:
	// Menu.activate();
	// break;
	//
	// case Memory.STATE_GAME:
	// Game.activate();
	// break;
	//
	// case Memory.STATE_SCORE:
	// Score.activate();
	// break;
	// }
	// }
	//
	// switch (Memory.state) {
	// case Memory.STATE_INTRO:
	// Intro.animate(time);
	// break;
	// }

	requestAnimationFrame($.animate);
	$.renderer.render($.scene, $.camera);
	TWEEN.update();
}

$.register = function(name, page) {
	$.pages[name] = page;
}

$.activate = function(name) {
	if ($.activePage) {
		$.activePage.inactivate();
	}

	$.activePage = $.pages[name];
	$.activePage.activate();
}

$.get = function(name) {
	return $.pages[name];
}

$.play = function(id, position, volume) {
	position = position || $.camera.position;
	volume = volume || 1;
	
	var distance = position.distanceTo($.camera.position);
	
	if (distance > 100) {
		return;
	}

	createjs.Sound.play(id, "none", 0, 0, 0, Math.min((1 - distance / 100) * volume, 1));
}

$.load = function() {
	$.loadSound("bubble0", "asset/bubble0.ogg");
	$.loadSound("bubble1", "asset/bubble1.ogg");
	$.loadSound("bubble2", "asset/bubble2.ogg");
	$.loadSound("spring", "asset/spring.ogg");
	$.loadSound("grow", "asset/grow.ogg");
	

	this.firework.load();
	for (name in $.pages) {
		$.pages[name].load();
	}
}

$.loadSound = function(id, asset) {
	createjs.Sound.registerSound(asset, id);
}

$.addClickable = function(mesh, object, handler) {
	mesh.onClickObject = object;
	mesh.onClickHandler = handler;
	$.clickableMeshes.push(mesh);
}

$.removeClickable = function(mesh) {
	mesh.onClick = null;
	$.clickableMeshes.splice($.clickableMeshes.indexOf(mesh), 1);
}

$.removeAllClickables = function() {
	$.clickableMeshes = [];
}

$.setClick = function(handler) {
	$.click = handler;
}

$.addBlock = function() {
	$.block += 1;
}

$.removeBlock = function() {
	$.block -= 1;

	if ($.block < 0) {
		$.block = 0;
	}
}

$.message = function(message) {
	document.getElementById('message').innerHTML = message;
}

$.onDocumentMouseDown = function(event) {
	event.preventDefault();

	if ($.block > 0) {
		return;
	}

	if ($.click) {
		if ($.click()) {
			return;
		}
	}

	var vector = new THREE.Vector3((event.clientX / window.innerWidth) * 2 - 1,
			-(event.clientY / window.innerHeight) * 2 + 1, 0.5);
	$.projector.unprojectVector(vector, $.camera);

	var raycaster = new THREE.Raycaster($.camera.position, vector.sub($.camera.position).normalize());
	var intersects = raycaster.intersectObjects($.clickableMeshes);

	for ( var i = 0; i < intersects.length; i += 1) {
		var mesh = intersects[i].object;

		if (mesh.onClickHandler.call(mesh.onClickObject, mesh)) {
			return;
		}
	}
}

$.onDocumentMouseMove = function(event) {
	$.mouse = {
		x : (event.clientX - $.windowSize.width / 2) / ($.windowSize.width / 2),
		y : (event.clientY - $.windowSize.height / 2) / ($.windowSize.height / 2)
	}
}

$.onWindowResize = function() {
	$.windowSize = {
		width : window.innerWidth,
		height : window.innerHeight
	}

	$.camera.aspect = $.windowSize.width / $.windowSize.height;
	$.camera.updateProjectionMatrix();

	$.renderer.setSize(window.innerWidth, window.innerHeight);
}
