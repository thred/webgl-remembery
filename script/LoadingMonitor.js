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

        console.log(`${loaded}/${total}`);
        if (loaded === total) {

            scope.dispatchEvent({
                type: 'load'
            });

        }
    };

    this.add = function(loader) {
        total++;

        if (loader.on) {
            loader.on("fileload", onLoad);
        }
        else if (loader.addEventListener) {
            loader.addEventListener('load', onLoad);
            loader.addEventListener('loadComplete', onLoad);
        }
        else {
            loader.onLoad = this.onLoad;
        }
    };

    this.addEventListener = THREE.EventDispatcher.prototype.addEventListener;
    this.dispatchEvent = THREE.EventDispatcher.prototype.dispatchEvent;

};