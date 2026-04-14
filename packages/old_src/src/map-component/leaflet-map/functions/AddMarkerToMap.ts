/* eslint-disable @typescript-eslint/no-explicit-any */

import * as L from 'leaflet';
import useMapLocalStorage from './MapLocalStorage';

const AddMarkerToMap = (
	map: L.Map,
	e: {
		shape: string;
		layer: L.Layer;
	},
	onCenterChanged?: (center: [number, number]) => void
) => {
	// if shape is a marker, add to geoJson but mark as CenterMarker
	// if shape is a marker, add to geoJson but mark as CenterMarker
	const marker = e.layer as L.Marker;

	// Notify the center change as [lat, lng]
	const { lat, lng } = marker.getLatLng();
	onCenterChanged?.([lat, lng]);

	useMapLocalStorage.setCenter([lat, lng]);

	map.setView(marker.getLatLng());
	// And remove other marker from the map, there is only one center marker
	map.eachLayer((layer) => {
		if (layer instanceof L.Marker && layer !== marker) {
			map.removeLayer(layer);
		}
	});
};

export { AddMarkerToMap };
