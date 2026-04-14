/* eslint-disable @typescript-eslint/no-explicit-any */

import Draw from 'ol/interaction/Draw.js';
import TileLayer from 'ol/layer/Tile.js';
import Map from 'ol/Map.js';
import { transform } from 'ol/proj';
import OSM from 'ol/source/OSM.js';
import VectorSource from 'ol/source/Vector.js';
import View from 'ol/View.js';
import { useEffect, useRef } from 'react';
import 'ol/ol.css';
import Control from 'ol/control/Control.js';
import { defaults as defaultControls } from 'ol/control/defaults.js';
import FullScreen from 'ol/control/FullScreen.js';
import VectorLayer from 'ol/layer/Vector.js';

import './custom-css.css'; // Import custom CSS for RotateNorthControl

class DrawLineStringControl extends Control {
	private source: VectorSource;
	private callBack?: (feature: any) => void;

	constructor(options: any) {
		const button = document.createElement('button');
		button.innerHTML = 'I';

		const element = document.createElement('div');
		element.className = 'draw-line-string ol-unselectable ol-control';
		element.appendChild(button);

		super({
			element: element,
			target: options.target,
		});

		this.source = options.source;
		this.callBack = options.callBack;

		button.addEventListener('click', this.handleDrawLine.bind(this), false);
	}

	handleDrawLine() {
		//add a new Draw interaction to the map
		const map = this.getMap();

		if (!map) return;
		const draw = new Draw({
			source: this.source,
			type: 'LineString',
		});

		draw.on('drawend', (event) => {
			const feature = event.feature;
			// You can handle the drawn feature here, e.g., add it to a layer or log it
			this.callBack?.(feature);
		});
		map?.addInteraction(draw);
	}
}

function OpenLayersMap({ onDrawChanged }: { onDrawChanged?: (feature: any) => void }) {
	const mapRef = useRef<Map | null>(null);
	useEffect(() => {
		let map = mapRef.current;

		if (!map) {
			const raster = new TileLayer({
				source: new OSM(),
			});

			const source = new VectorSource({ wrapX: true });
			const vector = new VectorLayer({
				source: source,
			});

			map = new Map({
				controls: defaultControls().extend([
					new FullScreen(),
					new DrawLineStringControl({ source, callBack: onDrawChanged }),
				]),
				layers: [raster, vector],
				target: 'open-map',
				view: new View({
					center: transform([-0.09, 51.505], 'EPSG:4326', 'EPSG:3857'),
					zoom: 13,
				}),
			});

			mapRef.current = map;
		}
	}, [onDrawChanged]);

	return <div style={{ width: '100%', height: '100%' }} id="open-map" />;
}

export default OpenLayersMap;
