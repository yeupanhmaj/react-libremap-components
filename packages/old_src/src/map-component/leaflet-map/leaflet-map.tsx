/* eslint-disable @typescript-eslint/no-explicit-any */
import * as L from 'leaflet';
import { useEffect, useRef } from 'react';

import { GeomanColorOptions } from './GeomanColorOptions';
import './geoman-core/leaflet-geoman';
import './geoman-core/leaflet-geoman.css';

import type { LeafletMapViewProps } from '../../types/interface.js';
import useMapLocalStorage from './functions/MapLocalStorage.js';
import './leafle-map.style.css';
import './leaflet-core/leaflet.css';
import './leaflet-core/leaflet.fullscreen.css';
import './leaflet-core/leaflet.fullscreen.min.js';
import { MapFunctions } from './functions/MapFunctions.js';

const defaultUrlTemplate = 'https://api.myptv.com/rastermaps/v1/image-tiles/{z}/{x}/{y}';
const latlngAfterDecimalPoints = 15;
// Context menu helper functions
const showContextMenu = (point: L.Point, lat: number, lng: number, map: L.Map) => {
	// Remove any existing context menu
	hideContextMenu();

	const mapContainer = map.getContainer();
	const menu = document.createElement('div');
	menu.id = 'map-context-menu';
	menu.className = 'map-context-menu';
	menu.style.cssText = `
    position: absolute;
    background: white;
    border: 1px solid #ccc;
    border-radius: 4px;
    box-shadow: 0 2px 8px rgba(0,0,0,0.15);
    z-index: 1000;
    min-width: 180px;
    padding: 4px 0;
    font-family: -apple-system, BlinkMacSystemFont, 'Segoe UI', sans-serif;
    font-size: 13px;
    left: ${point.x}px;
    top: ${point.y}px;
  `;

	// Copy coordinates option
	const copyOption = document.createElement('div');
	copyOption.className = 'context-menu-item';
	copyOption.style.cssText = `
    padding: 8px 12px;
    cursor: pointer;
    border-bottom: 1px solid #eee;
    color: #333;
  `;
	copyOption.innerHTML = `📋 Copy coordinates<br><small style="color: #666;">${lat.toFixed(latlngAfterDecimalPoints)}, ${lng.toFixed(latlngAfterDecimalPoints)}</small>`;
	copyOption.onmouseover = () => (copyOption.style.backgroundColor = '#f5f5f5');
	copyOption.onmouseout = () => (copyOption.style.backgroundColor = 'transparent');
	copyOption.onclick = () => {
		navigator.clipboard.writeText(
			`${lat.toFixed(latlngAfterDecimalPoints)}, ${lng.toFixed(latlngAfterDecimalPoints)}`
		);
		hideContextMenu();
		// Optional: Show a brief notification
		showCopyNotification('Coordinates copied to clipboard!');
	};

	// Copy latitude option
	const copyLatOption = document.createElement('div');
	copyLatOption.className = 'context-menu-item';
	copyLatOption.style.cssText = `
    padding: 8px 12px;
    cursor: pointer;
    border-bottom: 1px solid #eee;
    color: #333;
  `;
	copyLatOption.innerHTML = `📍 Copy latitude<br><small style="color: #666;">${lat.toFixed(latlngAfterDecimalPoints)}</small>`;
	copyLatOption.onmouseover = () => (copyLatOption.style.backgroundColor = '#f5f5f5');
	copyLatOption.onmouseout = () => (copyLatOption.style.backgroundColor = 'transparent');
	copyLatOption.onclick = () => {
		navigator.clipboard.writeText(lat.toFixed(latlngAfterDecimalPoints));
		hideContextMenu();
		showCopyNotification('Latitude copied to clipboard!');
	};

	// Copy longitude option
	const copyLngOption = document.createElement('div');
	copyLngOption.className = 'context-menu-item';
	copyLngOption.style.cssText = `
    padding: 8px 12px;
    cursor: pointer;
    color: #333;
  `;
	copyLngOption.innerHTML = `📍 Copy longitude<br><small style="color: #666;">${lng.toFixed(latlngAfterDecimalPoints)}</small>`;
	copyLngOption.onmouseover = () => (copyLngOption.style.backgroundColor = '#f5f5f5');
	copyLngOption.onmouseout = () => (copyLngOption.style.backgroundColor = 'transparent');
	copyLngOption.onclick = () => {
		navigator.clipboard.writeText(lng.toFixed(latlngAfterDecimalPoints));
		hideContextMenu();
		showCopyNotification('Longitude copied to clipboard!');
	};

	menu.appendChild(copyOption);
	menu.appendChild(copyLatOption);
	menu.appendChild(copyLngOption);

	mapContainer.appendChild(menu);

	// Position menu to stay within map bounds
	const rect = mapContainer.getBoundingClientRect();
	const menuRect = menu.getBoundingClientRect();

	if (point.x + menuRect.width > rect.width) {
		menu.style.left = `${point.x - menuRect.width}px`;
	}

	if (point.y + menuRect.height > rect.height) {
		menu.style.top = `${point.y - menuRect.height}px`;
	}
};

const hideContextMenu = () => {
	const existingMenu = document.getElementById('map-context-menu');
	if (existingMenu) {
		existingMenu.remove();
	}
};

const showCopyNotification = (message: string) => {
	// Remove any existing notification
	const existingNotification = document.getElementById('copy-notification');
	if (existingNotification) {
		existingNotification.remove();
	}

	const notification = document.createElement('div');
	notification.id = 'copy-notification';
	notification.style.cssText = `
    position: fixed;
    top: 20px;
    right: 20px;
    background: #28a745;
    color: white;
    padding: 12px 16px;
    border-radius: 4px;
    box-shadow: 0 2px 8px rgba(0,0,0,0.15);
    z-index: 10000;
    font-family: -apple-system, BlinkMacSystemFont, 'Segoe UI', sans-serif;
    font-size: 14px;
    opacity: 0;
    transition: opacity 0.3s ease;
  `;
	notification.textContent = message;

	document.body.appendChild(notification);

	// Fade in
	setTimeout(() => (notification.style.opacity = '1'), 10);

	// Fade out and remove
	setTimeout(() => {
		notification.style.opacity = '0';
		setTimeout(() => notification.remove(), 300);
	}, 2000);
};

const LeafletMapView = ({
	tileOptions,
	showDrawControls = true,
	color = GeomanColorOptions.Black,
	center,
	onCenterChanged,
	zoom = 13,
	onZoomChanged,
	geoJson,
	onGeoJsonChange,
	isShowCenterMarker = true,
	apiKey,
	flyToOnCenterChange = true,
	flyOptions,
	clearStorageOnMount = false,
	storageKey,
}: LeafletMapViewProps): JSX.Element => {
	const mapRef = useRef<L.Map | null>(null);
	const mapContainerRef = useRef<HTMLDivElement | null>(null);
	const centerMarkerRef = useRef<L.Marker | null>(null);
	const isProgrammaticZoomRef = useRef<boolean>(false);
	const previousStorageKeyRef = useRef<string | undefined>(storageKey);

	const geoJsonChangeCallback = (feature: any): void => {
		if (storageKey) {
			useMapLocalStorage.setItem(feature, storageKey);
		} else {
			useMapLocalStorage.setItem(feature);
		}
		onGeoJsonChange?.(feature);
	};

	// Clear storage on mount if requested (useful for forms)
	useEffect(() => {
		if (clearStorageOnMount) {
			if (storageKey) {
				useMapLocalStorage.clear(storageKey);
			} else {
				useMapLocalStorage.clear();
			}
		}
	}, [clearStorageOnMount, storageKey]);

	// Clean up old storage when storage key changes
	useEffect(() => {
		const previousKey = previousStorageKeyRef.current;

		// If storage key changed and we had a previous key, clean it up
		if (previousKey !== storageKey && previousKey !== undefined) {
			useMapLocalStorage.clear(previousKey);
		}

		// Update the ref with current storage key
		previousStorageKeyRef.current = storageKey;
	}, [storageKey]);

	useEffect(() => {
		if (!mapContainerRef.current) return;

		// Only initialize if not already done
		if (mapRef.current) return;
		// Create the map
		const mapOptions: L.MapOptions = {
			fullscreenControl: true,
			zoom: zoom,
			scrollWheelZoom: true,
		};

		// Only set center if provided
		if (center && center.length === 2) {
			mapOptions.center = center;
		}

		const map = L.map(mapContainerRef.current, mapOptions);

		mapRef.current = map;

		// Add tile layer
		const tileUrl = `${defaultUrlTemplate}?apiKey=${apiKey}`;
		L.tileLayer(tileUrl, {
			maxZoom: 19,
			...tileOptions,
		}).addTo(map);

		//Enable Geoman controls
		map.pm.addControls({
			position: 'topleft',
			drawMarker: true,
			drawPolygon: true,
			drawPolyline: true,
			drawCircle: true,
			drawRectangle: true,
			drawCircleMarker: false,
			drawText: true,
			editMode: true,
			dragMode: true,
			cutPolygon: false,
			removalMode: true,
			rotateMode: false,
		});

		// #region init draw event
		map.on('pm:create', (e) => {
			// New shape GeoJSON object
			const layer = e.layer as L.Layer;
			// if the created shape is a polygon or polyline, set the color
			if (e.shape === 'Line' || e.shape === 'Polygon' || e.shape === 'Rectangle') {
				return MapFunctions.AddShapeToMap(e, geoJsonChangeCallback);
			}

			// if shape = circle
			if (e.shape === 'Circle') {
				return MapFunctions.AddCircleToMap(e, geoJsonChangeCallback);
			}

			// if shape = marker
			if (e.shape === 'Marker') {
				return MapFunctions.AddMarkerToMap(map, e, onCenterChanged);
			}

			// if shape = text
			if (e.shape === 'Text') {
				// Initialize the text marker layer id
				return MapFunctions.AddTextToMap(e, geoJsonChangeCallback);
			}

			// Wait until DOM is available
			setTimeout(() => {
				// @ts-expect-error: from leaflet
				const el = layer.getElement();
				if (el) {
					// Get textarea element
					const textarea = el.querySelector('textarea');
					if (textarea) {
						textarea.style.color = storageKey
							? useMapLocalStorage.getColor(storageKey)
							: useMapLocalStorage.getColor(); // Set color
					}
				}
			}, 0);
		});

		// custom control
		map.pm.Toolbar.createCustomControl({
			name: 'colorPickerControl', // Unique name for your control
			block: 'draw', // Puts it in the 'options' block of the toolbar
			title: 'Pick a Color', // Tooltip text
			className: 'custom-color-picker-class', // CSS class for your icon
			toggle: false, // Set to false if it's just a button, not a toggle
			onClick: () => MapFunctions.OpenColorPalette(map),
		});

		map.pm.Toolbar.createCustomControl({
			name: 'pickedColor', // Unique name for your control
			block: 'draw', // Puts it in the 'options' block of the toolbar
			title: 'Selected color', // Tooltip text
			className: 'custom-picked-color', // CSS class for your icon
			toggle: false, // Set to false if it's just a button, not a toggle
			disabled: true, // Initially disabled, can be set to true if needed
		});

		// --- Add Custom Recenter Control ---
		map.pm.Toolbar.createCustomControl({
			name: 'recenterMapControl', // Unique name for your control
			block: 'draw', // Puts it in the 'edit' block of the toolbar
			title: 'Recenter', // Tooltip text
			className: 'custom-recenter-class', // CSS class for your icon
			onClick: () => {
				const savedCenter = storageKey
					? useMapLocalStorage.getCenter(storageKey)
					: useMapLocalStorage.getCenter();
				if (savedCenter && savedCenter.length === 2) {
					isProgrammaticZoomRef.current = true;
					map.flyTo(savedCenter as L.LatLngTuple, zoom);
				}
			},
			toggle: false, // Set to false if it's just a button, not a toggle
			disabled: false,
		});

		map.on('zoomend', () => {
			// Only trigger callback if it's not a programmatic zoom change
			if (!isProgrammaticZoomRef.current) {
				const zoomLevel = map.getZoom();
				onZoomChanged?.(zoomLevel);
			}
			// Reset the flag after the zoom event
			isProgrammaticZoomRef.current = false;
		});

		// Add custom context menu for copying coordinates
		map.on('contextmenu', (e) => {
			const { lat, lng } = e.latlng;
			showContextMenu(e.containerPoint, lat, lng, map);
		});

		// Hide context menu on click anywhere else
		map.on('click', () => {
			hideContextMenu();
		});

		// Hide context menu on zoom or pan
		map.on('zoomstart movestart', () => {
			hideContextMenu();
		});

		// #endregion

		// #region this code it init so we use the color from the param
		MapFunctions.ChangeColor(
			(storageKey ? useMapLocalStorage.getColor(storageKey) : useMapLocalStorage.getColor()) ||
				GeomanColorOptions.Black
		);

		map.pm.setGlobalOptions({
			pathOptions: {
				color:
					(storageKey ? useMapLocalStorage.getColor(storageKey) : useMapLocalStorage.getColor()) ||
					GeomanColorOptions.Black,
			},
		});
		// #endregion

		// Store the map reference
		mapRef.current = map;

		return (): void => {
			if (!map || !map.pm) return;

			// Hide any open context menu
			hideContextMenu();

			// Clear layer registry and local storage
			MapFunctions.ClearLayerRegistry(map);
			useMapLocalStorage.clear();

			if (mapRef.current) {
				mapRef.current.remove(); // Properly destroy map
				mapRef.current = null;
			}
		};
		// eslint-disable-next-line react-hooks/exhaustive-deps
	}, []);

	useEffect(() => {
		// #region load existing GeoJSON features
		const map = mapRef.current;

		if (!map || !map.pm) return;

		// #region Init Data
		if (center && center.length === 2) {
			if (storageKey) {
				useMapLocalStorage.setCenter(center, storageKey);
			} else {
				useMapLocalStorage.setCenter(center);
			}
		}

		if (storageKey) {
			useMapLocalStorage.setItem(geoJson || [], storageKey);
			useMapLocalStorage.setColor(color, storageKey);
		} else {
			useMapLocalStorage.setItem(geoJson || []);
			useMapLocalStorage.setColor(color);
		}
		// #endregion

		/// initialize map with geoJson using incremental updates
		MapFunctions.UpdateMapLayers(map, geoJson, color, geoJsonChangeCallback);

		// #endregion load existing GeoJSON features

		//#region cleanup
		return (): void => {
			// Layer cleanup is now handled by the layer registry
			// This effect cleanup is mainly for component unmounting
		};
		// #endregion cleanup
		// eslint-disable-next-line react-hooks/exhaustive-deps
	}, [geoJson]);

	// React to external center prop changes
	useEffect(() => {
		const map = mapRef.current;
		if (!map) return;

		// Always clean up existing center marker first
		if (centerMarkerRef.current) {
			map.removeLayer(centerMarkerRef.current);
			centerMarkerRef.current = null;
		}

		// Only proceed if center is provided
		if (center && center.length === 2) {
			const latLng = L.latLng(center[0], center[1]);
			if (storageKey) {
				useMapLocalStorage.setCenter(center, storageKey);
			} else {
				useMapLocalStorage.setCenter(center);
			}

			// Set flag to indicate this is a programmatic change
			isProgrammaticZoomRef.current = true;

			if (flyToOnCenterChange) {
				map.flyTo(latLng, map.getZoom(), flyOptions);
			} else {
				map.setView(latLng, map.getZoom(), flyOptions);
			}

			// Add center marker if requested
			if (isShowCenterMarker) {
				centerMarkerRef.current = L.marker(latLng, {
					draggable: false,
					pmIgnore: true,
				}).addTo(map);
			}
		}
	}, [isShowCenterMarker, center, flyOptions, flyToOnCenterChange, storageKey]);

	useEffect(() => {
		if (!mapContainerRef.current) return;
		// If the map is already initialized, just update the controls
		if (mapRef.current) {
			const drawControls = document.getElementsByClassName(
				'leaflet-pm-toolbar leaflet-pm-draw leaflet-bar leaflet-control'
			)[0] as HTMLElement;
			const editControls = document.getElementsByClassName(
				'leaflet-pm-toolbar leaflet-pm-edit leaflet-bar leaflet-control'
			)[0] as HTMLElement;

			drawControls.style.display = showDrawControls ? 'block' : 'none';
			editControls.style.display = showDrawControls ? 'block' : 'none';
		}
	}, [showDrawControls]);

	return <div ref={mapContainerRef} id="map" style={{ height: '100%', width: '100%' }}></div>;
};

export default LeafletMapView;
