/* eslint-disable @typescript-eslint/no-explicit-any */
import * as L from 'leaflet';
import { GeomanColorOptions, type GeomanColorOptionsType } from '../GeomanColorOptions';
import { AddCircleToMap } from './AddCircleToMap';
import { AddMarkerToMap } from './AddMarkerToMap';
import { AddShapeToMap } from './AddShapeToMap';
import { AddTextToMap } from './AddTextToMap';
import useMapLocalStorage from './MapLocalStorage';

const ChangeColor = (_color: GeomanColorOptionsType | string): void => {
	const parent = document.querySelector('.custom-picked-color');
	if (!parent) return;

	// Remove any existing color display
	const existingColorDisplay = document.getElementById('color-display');
	if (existingColorDisplay) existingColorDisplay.remove();

	// create a new div to display the selected color
	const colorDisplay = document.createElement('div', {});

	colorDisplay.id = 'color-display';
	colorDisplay.style.width = '100%';
	colorDisplay.style.height = '100%';
	colorDisplay.style.background = String(_color);
	colorDisplay.style.border = '2px solid #eee';
	colorDisplay.style.borderRadius = '4px';

	parent.appendChild(colorDisplay);
};

const OpenColorPalette = (map: L.Map) => {
	const colorPalette = Object.values(GeomanColorOptions);
	// get the color picker container, which is the 8th button in the toolbar
	// exclude the zoom which is the default of leaflet instead of the geoman control
	const mapContainer = document.getElementById('map');

	if (!mapContainer) return;

	// Remove any existing color picker popup
	const existingPopup = document.getElementById('color-picker-popup');
	if (existingPopup) existingPopup.remove();

	// Create popup container
	const popup = document.createElement('div');

	popup.id = 'color-picker-popup';
	popup.style.position = 'absolute';
	popup.style.top = '320px';
	popup.style.left = '48px';
	popup.style.zIndex = '100000';
	popup.style.background = '#fff';
	popup.style.border = '1px solid #ccc';
	popup.style.padding = '4px';
	popup.style.borderRadius = '6px';
	popup.style.boxShadow = '0 2px 8px rgba(0,0,0,0.15)';
	popup.style.display = 'flex';
	popup.style.flexDirection = 'column';
	popup.style.gap = '4px';

	// Add color options
	// Split the colorPalette into two rows of 4 colors each
	const colorsPerRow = 4;
	for (let row = 0; row < 2; row++) {
		const rowDiv = document.createElement('div');
		rowDiv.style.display = 'flex';
		rowDiv.style.gap = '8px';

		for (let col = 0; col < colorsPerRow; col++) {
			const colorIndex = row * colorsPerRow + col;
			if (colorIndex >= colorPalette.length) break;

			const color = colorPalette[colorIndex];
			const colorBtn = document.createElement('button');
			colorBtn.style.background = color;
			colorBtn.style.width = '28px';
			colorBtn.style.height = '28px';
			colorBtn.style.border = '2px solid #eee';
			colorBtn.style.borderRadius = '30%';
			colorBtn.style.cursor = 'pointer';
			colorBtn.title = color;
			colorBtn.onclick = (): void => {
				// Close the popup after selecting a color
				popup.remove();
				map.pm.setGlobalOptions({
					pathOptions: { color },
				});
				ChangeColor?.(color);
				useMapLocalStorage.setColor(color);
			};

			rowDiv.appendChild(colorBtn);
		}
		popup.appendChild(rowDiv);
	}

	mapContainer.appendChild(popup);
};

// Common event handler factory
const createCommonEventHandlers = (_id: string, geoJsonChangeCallback: (feature: any) => void) => ({
	onDragEnd: (layer: L.Layer) => {
		const newGeoJsonData = (useMapLocalStorage.getItem() || []).map((f) => {
			if (f.properties?.id === _id) {
				return {
					...f,
					geometry: (layer as any).toGeoJSON().geometry,
				};
			}
			return f;
		});
		geoJsonChangeCallback?.(newGeoJsonData);
	},

	onRemove: () => {
		const newGeoJsonData = (useMapLocalStorage.getItem() || []).filter(
			(f) => f.properties?.id !== _id
		);
		geoJsonChangeCallback?.(newGeoJsonData);
	},
});

// Circle-specific functions
const createCircleLayer = (
	feature: GeoJSON.Feature,
	color: string,
	geoJsonChangeCallback: (feature: any) => void
): L.Circle => {
	const _id = feature.properties?.id;
	const latlng = L.latLng(
		(feature.geometry as any).coordinates[1],
		(feature.geometry as any).coordinates[0]
	);

	const circle = L.circle(latlng, {
		radius: feature.properties?.radius || 100,
		color: feature.properties?.color || color,
	});

	// Circle-specific drag handler
	circle.on('pm:dragend', () => {
		const newGeoJsonData = (useMapLocalStorage.getItem() || []).map((f) => {
			if (f.properties?.id === _id) {
				return {
					...f,
					geometry: {
						...f.geometry,
						coordinates: [circle.getLatLng().lng, circle.getLatLng().lat],
						type: feature.geometry.type,
					},
					properties: {
						...f.properties,
						radius: circle.getRadius(),
					},
				};
			}
			return f;
		});
		geoJsonChangeCallback?.(newGeoJsonData as any);
	});

	// Circle-specific edit handler
	circle.on('pm:edit', () => {
		const newGeoJsonData = (useMapLocalStorage.getItem() || []).map((f) => {
			if (f.properties?.id === _id) {
				return {
					...f,
					geometry: {
						...f.geometry,
						coordinates: [circle.getLatLng().lng, circle.getLatLng().lat],
						type: feature.geometry.type,
					},
				};
			}
			return f;
		});
		geoJsonChangeCallback?.(newGeoJsonData);
	});

	const { onRemove } = createCommonEventHandlers(_id, geoJsonChangeCallback);
	circle.on('pm:remove', onRemove);

	return circle;
};

// Shape layer functions (Polygon, LineString, Rectangle)
const createShapeLayer = (
	feature: GeoJSON.Feature,
	color: string,
	geoJsonChangeCallback: (feature: any) => void
): L.GeoJSON => {
	const _id = feature.properties?.id;
	const currentType = feature.geometry.type;

	const layer = L.geoJSON(feature, {
		style: (geoFeature) => {
			const featureColor = geoFeature?.properties?.color || color;
			return featureColor ? { color: featureColor } : {};
		},
	});

	// Shape-specific drag handler
	layer.on('pm:dragend', () => {
		const lnglat = layer.toGeoJSON(20);
		// @ts-expect-error: from leaflet
		const updatedFeature = lnglat.features[0];

		const newGeoJsonData = (useMapLocalStorage.getItem() || []).map((f) => {
			if (f.properties?.id === _id) {
				return {
					...f,
					...updatedFeature,
					geometry: {
						...updatedFeature.geometry,
						type: currentType,
					},
				};
			}
			return f;
		});
		geoJsonChangeCallback?.(newGeoJsonData as any);
	});

	// Shape-specific edit handler
	layer.on('pm:edit', () => {
		const currentLayer = layer.toGeoJSON(20);
		// @ts-expect-error: from leaflet
		const updatedFeature = currentLayer.features[0];

		const newGeoJsonData = (useMapLocalStorage.getItem() || []).map((f) => {
			if (f.properties?.id === _id) {
				return {
					...f,
					...updatedFeature,
					geometry: {
						...updatedFeature.geometry,
						type: currentType,
					},
				};
			}
			return f;
		});
		geoJsonChangeCallback?.(newGeoJsonData);
	});

	const { onRemove } = createCommonEventHandlers(_id, geoJsonChangeCallback);
	layer.on('pm:remove', onRemove);

	return layer;
};

// Text marker functions
const createTextMarker = (
	feature: GeoJSON.Feature,
	geoJsonChangeCallback: (feature: any) => void
): L.Marker => {
	const _id = feature.properties?.id;
	const latlng = L.latLng(
		(feature.geometry as any).coordinates[1],
		(feature.geometry as any).coordinates[0]
	);

	const layer = L.marker(latlng, {
		textMarker: true,
	});

	const textContent = feature.properties?.text || '';
	if (layer.pm) {
		layer.pm.enable();
		if (typeof layer.pm.setText === 'function') {
			layer.pm.setText(textContent);
		}
	}

	// Text-specific blur handler
	layer.on('pm:textblur', () => {
		const geo = layer.toGeoJSON(20);
		const el = layer.getElement();
		const textarea = el && el.querySelector('textarea');

		const newGeoData = {
			...geo,
			type: 'Feature',
			geometry: {
				type: 'Point',
				coordinates: [layer.getLatLng().lng, layer.getLatLng().lat],
			},
			properties: {
				id: _id,
				shape: 'Text',
				isTextMarker: true,
				text: layer.pm.getText(),
				color: (textarea && textarea.style && textarea.style.color) || GeomanColorOptions.Black,
			},
		};

		const newDrawData = [
			...(useMapLocalStorage.getItem() ?? []).filter((f) => f.properties?.id !== _id),
			newGeoData,
		];
		geoJsonChangeCallback?.(newDrawData as any);
	});

	const { onDragEnd, onRemove } = createCommonEventHandlers(_id, geoJsonChangeCallback);
	layer.on('pm:dragend', () => onDragEnd(layer));
	layer.on('pm:remove', onRemove);

	// Set text color after DOM is ready
	setTimeout(() => {
		const el = layer.getElement();
		if (el) {
			const textarea = el.querySelector('textarea');
			if (textarea) {
				textarea.style.color = feature.properties?.color || GeomanColorOptions.Black;
			}
		}
	}, 0);

	return layer;
};

// Regular marker functions
const createRegularMarker = (
	feature: GeoJSON.Feature,
	geoJsonChangeCallback: (feature: any) => void
): L.Marker => {
	const _id = feature.properties?.id;
	const latLng = L.latLng(
		(feature.geometry as any).coordinates[1],
		(feature.geometry as any).coordinates[0]
	);

	const layer = L.marker(latLng, {
		textMarker: false,
	});

	// Set custom icon if provided
	if (feature.properties?.icon && typeof feature.properties.icon === 'string') {
		layer.setIcon(
			L.divIcon({
				className: 'eag-map-display-icon',
				html: feature.properties.icon,
				iconAnchor: [12, 41],
				tooltipAnchor: [16, -28],
				shadowSize: [20, 20],
			})
		);
	}

	// Set tooltip if provided
	if (feature.properties?.tooltip && feature.properties.tooltip.text) {
		layer.bindTooltip(String(feature.properties.tooltip.text), {
			permanent: feature.properties.tooltip.permanent ?? false,
			direction: feature.properties.tooltip.direction ?? 'right',
		});
	}

	const { onDragEnd, onRemove } = createCommonEventHandlers(_id, geoJsonChangeCallback);
	layer.on('pm:dragend', () => onDragEnd(layer));
	layer.on('pm:remove', onRemove);

	return layer;
};

// Feature type detection helpers
const isCircleFeature = (feature: GeoJSON.Feature): boolean => {
	return (
		feature.geometry.type === 'Point' &&
		feature.properties?.shape === 'Circle' &&
		typeof feature.properties.radius === 'number'
	);
};

const isShapeFeature = (feature: GeoJSON.Feature): boolean => {
	const type = feature.geometry.type;
	return type === 'LineString' || type === 'Polygon' || (type as any) === 'Rectangle';
};

const isTextMarker = (feature: GeoJSON.Feature): boolean => {
	return (
		feature.geometry.type === 'Point' &&
		feature.properties?.shape === 'Text' &&
		feature.properties?.isTextMarker
	);
};

const isRegularMarker = (feature: GeoJSON.Feature): boolean | null => {
	return (
		feature.geometry.type === 'Point' && feature.properties && !feature.properties.isTextMarker
	);
};

// Layer registry management - create per map instance
const mapLayerRegistries = new WeakMap<L.Map, Map<string, L.Layer>>();

const getOrCreateLayerRegistry = (map: L.Map): Map<string, L.Layer> => {
	let registry = mapLayerRegistries.get(map);
	if (!registry) {
		registry = new Map<string, L.Layer>();
		mapLayerRegistries.set(map, registry);
	}
	return registry;
};

const clearLayerRegistry = (map: L.Map): void => {
	const registry = mapLayerRegistries.get(map);
	if (registry) {
		// Properly cleanup layers
		registry.forEach((layer) => {
			if (map.hasLayer(layer)) {
				map.removeLayer(layer);
			}
			// Remove event listeners to prevent memory leaks
			if (layer.off) {
				layer.off();
			}
		});
		registry.clear();
		mapLayerRegistries.delete(map);
	}
};

const createLayerFromFeature = (
	feature: GeoJSON.Feature,
	color: string,
	geoJsonChangeCallback: (feature: any) => void
): L.Layer | null => {
	if (isCircleFeature(feature)) {
		return createCircleLayer(feature, color, geoJsonChangeCallback);
	} else if (isShapeFeature(feature)) {
		return createShapeLayer(feature, color, geoJsonChangeCallback);
	} else if (isTextMarker(feature)) {
		return createTextMarker(feature, geoJsonChangeCallback);
	} else if (isRegularMarker(feature)) {
		return createRegularMarker(feature, geoJsonChangeCallback);
	}
	return null;
};

const UpdateMapLayers = (
	map: L.Map,
	newGeoJSON: GeoJSON.Feature[] | undefined,
	color: string,
	geoJsonChangeCallback: (feature: any) => void
) => {
	const layerRegistry = getOrCreateLayerRegistry(map);

	if (!newGeoJSON) {
		// Remove all layers if no geoJSON
		layerRegistry.forEach((layer) => {
			if (map.hasLayer(layer)) {
				map.removeLayer(layer);
			}
		});
		layerRegistry.clear();
		return;
	}

	const newFeatureIds = new Set(newGeoJSON.map((f) => f.properties?.id).filter(Boolean));
	const existingIds = new Set(layerRegistry.keys());

	// Remove layers that no longer exist
	existingIds.forEach((id) => {
		if (!newFeatureIds.has(id)) {
			const layer = layerRegistry.get(id);
			if (layer && map.hasLayer(layer)) {
				map.removeLayer(layer);
			}
			layerRegistry.delete(id);
		}
	});

	// Add or update layers
	for (const feature of newGeoJSON) {
		const featureId = feature.properties?.id;
		if (!featureId) continue;

		const existingLayer = layerRegistry.get(featureId);

		if (existingLayer) {
			// Update existing layer if geometry or properties changed
			if (shouldUpdateLayer(feature, existingLayer)) {
				if (map.hasLayer(existingLayer)) {
					map.removeLayer(existingLayer);
				}
				const newLayer = createLayerFromFeature(feature, color, geoJsonChangeCallback);
				if (newLayer) {
					layerRegistry.set(featureId, newLayer);
					newLayer.addTo(map);
				}
			}
		} else {
			// Create new layer
			const newLayer = createLayerFromFeature(feature, color, geoJsonChangeCallback);
			if (newLayer) {
				layerRegistry.set(featureId, newLayer);
				newLayer.addTo(map);
			}
		}
	}
};

const shouldUpdateLayer = (feature: GeoJSON.Feature, layer: L.Layer): boolean => {
	// Check if we need to update the layer based on geometry changes
	try {
		const currentGeoJson = (layer as any).toGeoJSON?.();
		if (!currentGeoJson) return true; // If we can't get current state, update it

		// Compare geometries (simplified check)
		const currentGeometry = JSON.stringify(currentGeoJson.geometry);
		const newGeometry = JSON.stringify(feature.geometry);

		return currentGeometry !== newGeometry;
	} catch {
		// If comparison fails, update the layer
		return true;
	}
};

const ClearLayerRegistry = (map: L.Map) => {
	clearLayerRegistry(map);
};

// Legacy function for backward compatibility
const DrawMapFromGeoJson = (
	map: L.Map,
	geoJSON: GeoJSON.Feature[] | undefined,
	color: string,
	geoJsonChangeCallback: (feature: any) => void
) => {
	const layerRegistry = getOrCreateLayerRegistry(map);

	// Clear existing layers first
	layerRegistry.forEach((layer) => {
		if (map.hasLayer(layer)) {
			map.removeLayer(layer);
		}
	});
	layerRegistry.clear();

	// Use the new incremental update function
	UpdateMapLayers(map, geoJSON, color, geoJsonChangeCallback);
};

export const MapFunctions = {
	AddShapeToMap,
	AddCircleToMap,
	AddMarkerToMap,
	AddTextToMap,
	OpenColorPalette,
	ChangeColor,

	DrawMapFromGeoJson,
	UpdateMapLayers,
	ClearLayerRegistry,
};
