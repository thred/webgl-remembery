$.FireworkView = function() {
	$.View.call(this);

	this.objects = [];
};

$.FireworkView.prototype = Object.create($.View.prototype);

$.FireworkView.prototype.load = function() {
	this.bubbleBoundsGeometry = new THREE.PlaneGeometry(2, 2, 1, 1);
	this.bubbleBoundsTexture = Util.createTexturedMaterial('asset/bubbleBounds.png', 1, true, 0.5);
	this.bubbleBoundsTexture.depthTest = false;
	this.bubbleGeometry = new THREE.SphereGeometry(1, 16, 8);
	this.bubbleTexture = Util.createTexturedMaterial('asset/bubble.png', 1, true, 0.5);
	this.bubbleTexture.blending = THREE.AdditiveBlending;
	this.bubbleTexture.side = THREE.DoubleSide;
	this.bubbleTexture.depthTest = false;
};

$.FireworkView.prototype.animate = function(time, duration) {
	for (var i = 0; i < this.objects.length; i += 1) {
		this.objects[i].animate(time, duration);
	}
};

$.FireworkView.prototype.bubble = function(position, radius, maxSize) {
	var bubbleObject = new $.Bubble(this, this.bubbleBoundsGeometry, this.bubbleBoundsTexture, this.bubbleGeometry, this.bubbleTexture, position, radius, maxSize);

	this.addObject(bubbleObject);
};

$.FireworkView.prototype.addObject = function(object) {
	this.objects.push(object);
	$.WORLD.addObject(object);
};

$.FireworkView.prototype.removeObject = function(object) {
	this.objects.splice(this.objects.indexOf(object), 1);
	$.WORLD.removeObject(object);
};