/**
 * Copyright 2013 Manfred Hantschel
 * 
 * This file is part of WebGL-Remembery.
 * 
 * WebGL-Remembery is free software: you can redistribute it and/or modify
 * it under the terms of the GNU General Public License as published by
 * the Free Software Foundation, either version 3 of the License, or
 * (at your option) any later version.
 * 
 * WebGL-Remembery is distributed in the hope that it will be useful,
 * but WITHOUT ANY WARRANTY; without even the implied warranty of
 * MERCHANTABILITY or FITNESS FOR A PARTICULAR PURPOSE. See the
 * GNU General Public License for more details.
 * 
 * You should have received a copy of the GNU General Public License
 * along with WebGL-Remembery. If not, see <http://www.gnu.org/licenses/>.
 */

var $ = $ || {};

$.init = function() {
	$.SPEED = 1;
	$.WORLD = new $.World();
	$.MAIN = new $.Main();
	$.lastTime = new Date().getTime();

	document.addEventListener('mousedown', function(event) {
		$.WORLD.onDocumentMouseDown.call($.WORLD, event);
	}, false);

	document.addEventListener('mousemove', function(event) {
		$.WORLD.onDocumentMouseMove.call($.WORLD, event);
	}, false);

	window.addEventListener('resize', function(event) {
		$.WORLD.onWindowResize.call($.WORLD, event);
	}, false);
};

$.animate = function(time) {
	requestAnimationFrame($.animate);

	time = time / 1000 * $.SPEED;
	var duration = time - $.lastTime;

	$.MAIN.animate(time, duration);
	$.WORLD.animate(time, duration);

	TWEEN.update();

	$.lastTime = time;
};

$.message = function(message) {
	document.getElementById('message').innerHTML = message;
};

$.startLo = function() {
	$.LO = true;
	$.HI = false;
	$.load();
};

$.startHi = function() {
	$.LO = false;
	$.HI = true;
	$.load();
};

$.activate = function() {
	$.show(document.getElementById("buttons"));
};

$.load = function() {
	$.hide(document.getElementById("buttons"));
	$.show(document.getElementById("loading"));

	$.loadingMonitor = new $.LoadingMonitor();
	$.loadingMonitor.addEventListener('progress', $.progress, false);
	$.loadingMonitor.addEventListener('load', $.start, false);

	setTimeout(function() {
		$.init();
		$.MAIN.load($.loadingMonitor);
	}, 100);
};

$.progress = function(event) {
	//$.message(event.loaded + "/" + event.total);
	
	var elem = document.getElementById("loading-percent");
	var percent = Math.round(event.loaded / event.total * 100);

	elem.style.marginLeft = (100 - percent) + "px";
	elem.style.marginRight = (100 - percent) + "px";

	elem.style.paddingLeft = percent + "px";
	elem.style.paddingRight = percent + "px";
};


$.start = function() {
	$.hide(document.getElementById("header"));
	$.hide(document.getElementById("title"));
	$.hide(document.getElementById("footer"));
	$.animate();
	$.MAIN.start();
};

$.hide = function(div) {
	div.style.display = "none";
	div.style.visibility = "hidden";
};

$.show = function(div) {
	div.style.display = "block";
	div.style.visibility = "visible";
};