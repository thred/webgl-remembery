/**
 * @author mrdoob / http://mrdoob.com/
 */

$.LoadingMonitor = function() {

	THREE.EventDispatcher.call(this);

	var scope = this;
	var loaded = 0;
	var total = 0;

	var onLoad = function(event) {
			loaded++;

			scope.dispatchEvent({
				type: 'progress',
				loaded: loaded,
				total: total
			});

			if (loaded === total) {

				scope.dispatchEvent({
					type: 'load'
				});

			}
		};

	this.add = function(loader) {
		total++;

		if (loader.addEventListener) {
			loader.addEventListener('load', onLoad, false);
			loader.addEventListener('loadComplete', onLoad, false);
		}
		else {
			loader.onLoad = this.onLoad;
		}
	};

};