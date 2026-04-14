/* eslint-disable @typescript-eslint/no-unused-vars */
/* eslint-disable @typescript-eslint/no-explicit-any */

import type * as L from 'leaflet';
import { GeomanColorOptions } from '../GeomanColorOptions';
import useMapLocalStorage from './MapLocalStorage';

const AddTextToMap = (
	e: {
		shape: string;
		layer: L.Layer;
	},
	geoJsonChangeCallback: (feature: any) => void
) => {
	const layer = e.layer as L.Layer;
	// To be implemented if needed
	const _id = crypto.randomUUID();
	// Set layer event
	layer.on('pm:textblur', (_e: any) => {
		const geo = (layer as any).toGeoJSON(20);

		const el = (layer as any).getElement();
		const textarea = el && el.querySelector('textarea');

		const newGeoData = {
			...geo,
			type: 'Feature',
			geometry: {
				type: 'Point',
				coordinates: [(layer as any).getLatLng().lng, (layer as any).getLatLng().lat],
			},
			properties: {
				id: _id,
				shape: 'Text',
				isTextMarker: true,
				text: (layer as any).pm.getText(),
				color: (textarea && textarea.style && textarea.style.color) || GeomanColorOptions.Black,
			},
		};

		const newGeoJsonData = [
			...(useMapLocalStorage.getItem() ?? []).filter((f) => f.properties?.id !== _id),
			newGeoData,
		];
		geoJsonChangeCallback?.(newGeoJsonData as any);
	});

	layer.on('pm:dragend', (_e: any) => {
		const geo = (layer as any).toGeoJSON(20);

		const el = (layer as any).getElement();
		const textarea = el && el.querySelector('textarea');

		const newGeoData = {
			...geo,
			type: 'Feature',
			geometry: {
				type: 'Point',
				coordinates: [(layer as any).getLatLng().lng, (layer as any).getLatLng().lat],
			},
			properties: {
				id: _id,
				shape: 'Text',
				isTextMarker: true,
				text: (layer as any).pm.getText(),
				color: (textarea && textarea.style && textarea.style.color) || GeomanColorOptions.Black,
			},
		};

		const newGeoJsonData = [
			...(useMapLocalStorage.getItem() ?? []).filter((f) => f.properties?.id !== _id),
			newGeoData,
		];
		geoJsonChangeCallback?.(newGeoJsonData as any);
	});

	layer.on('pm:remove', () => {
		const newGeoJsonData = (useMapLocalStorage.getItem() || []).filter(
			(f) => f.properties?.id !== _id
		);
		geoJsonChangeCallback?.(newGeoJsonData);
	});
};

export { AddTextToMap };
