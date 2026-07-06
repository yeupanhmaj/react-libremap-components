import '@testing-library/jest-dom';
import { TextDecoder, TextEncoder } from 'node:util';

Object.assign(global, { TextDecoder, TextEncoder });

const uuid_regex = '[a-f0-9]{8}-[a-f0-9]{4}-[a-f0-9]{4}-[a-f0-9]{4}-[a-f0-9]{12}';

export { uuid_regex };

// MapLibre-gl mockup
const mockMapLibreMethods = {
	on: jest.fn(),
	off: jest.fn(),
	addControl: jest.fn(),
	removeControl: jest.fn(),
	fitBounds: jest.fn(),
	hasControl: jest.fn(() => true),
	getCanvas: () => document.createElement('canvas'),
	getContainer: () => ({
		style: {},
	}),
};

export { mockMapLibreMethods };

jest.mock('maplibre-gl/dist/maplibre-gl', () => {
	const originalModule = jest.requireActual('maplibre-gl/dist/maplibre-gl');

	return {
		...originalModule,
		GeolocateControl: jest.fn(),
		Map: function () {
			this.layers = [];
			this.sources = [];
			this.style = { sourceCaches: {} };

			const styleFunctions = {
				// eslint-disable-next-line @typescript-eslint/no-unused-vars
				addSource: (id, source) => {
					if (typeof id.id !== 'undefined') {
						this.sources.push(id);
						this.style.sourceCaches[id] = {};
					} else if (typeof id !== 'undefined') {
						this.sources.push(id);
					}
				},
				getSource: (id) => {
					if (this.sources.indexOf(id) !== -1) {
						return { setData: jest.fn() };
					}
					return false;
				},
				removeSource: (id) => {
					const sourcePosition = this.sources.indexOf(id);
					if (sourcePosition !== -1) {
						this.sources.splice(sourcePosition, 1);
						delete this.style.sourceCaches[id];
					}
				},
				addLayer: (layer) => {
					if (typeof layer.id !== 'undefined') {
						this.layers.push(layer.id);
						if (typeof layer.source !== 'undefined' && typeof layer.source === 'object') {
							this.sources.push(layer.id);
						}
					}
				},
				getLayer: (id) => {
					if (this.layers.indexOf(id) !== -1) {
						return {};
					}
					return false;
				},
				removeLayer: (id) => {
					const layerPosition = this.layers.indexOf(id);
					if (layerPosition !== -1) {
						this.layers.splice(layerPosition, 1);
					}
				},
			};

			return {
				...styleFunctions,
				once: (eventName, callback) => {
					callback();
				},
				remove: jest.fn(),
				setLayerZoomRange: jest.fn(),
				setLayoutProperty: jest.fn(),
				addImage: jest.fn(),
				loadImage: jest.fn(),
				removeImage: jest.fn(),
				hasImage: jest.fn(),
				project: jest.fn(),
				setZoom: jest.fn(),
				setPitch: jest.fn(),
				setCenter: jest.fn(),
				style: { ...styleFunctions, _layers: this.layers },
				layers: this.layers,
				sources: this.sources,
				_update: jest.fn(),
				...mockMapLibreMethods,
			};
		},
		NavigationControl: jest.fn(),
	};
});

window.URL.createObjectURL = () => {};
window.HTMLCanvasElement.prototype.getContext = () => {};
