/* eslint-disable @typescript-eslint/no-explicit-any */

import type * as L from 'leaflet';
import useMapLocalStorage from './MapLocalStorage';

const AddCircleToMap = (
	e: {
		shape: string;
		layer: L.Layer;
	},
	geoJsonChangeCallback: (feature: any) => void
) => {
	const newShape = (e.layer as any).toGeoJSON();
	const layer = e.layer as L.Layer;
	const _id = crypto.randomUUID();

	layer.on('pm:dragend', () => {
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
	});

	layer.on('pm:remove', () => {
		const newGeoJsonData = (useMapLocalStorage.getItem() || []).filter(
			(f) => f.properties?.id !== _id
		);
		geoJsonChangeCallback?.(newGeoJsonData);
	});

	const newGeoJsonData = (useMapLocalStorage.getItem() || []).concat({
		...newShape,
		type: 'Feature',
		geometry: {
			type: 'Point',
			coordinates: [(layer as L.Circle).getLatLng().lng, (layer as L.Circle).getLatLng().lat],
		},
		properties: {
			id: _id,
			radius: (layer as L.Circle).getRadius(),
			color: useMapLocalStorage.getColor(),
			shape: e.shape,
		},
	});

	// Update drawData with the new circle
	geoJsonChangeCallback?.(newGeoJsonData);
	return;
};

export { AddCircleToMap };
