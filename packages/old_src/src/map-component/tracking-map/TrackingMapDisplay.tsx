import L from 'leaflet';
import 'leaflet/dist/leaflet.css';
import { useEffect, useRef } from 'react';

import type { EagIconCache, EagTrackingMapProps } from '../../types/tracking-map-display-interface';
import { PointLayer } from './PointLayer';
import { PolygonLayer } from './PolygonLayer';
import { preLoadListIcons } from './preLoadListIcons';

const defaultUrlTemplate = 'https://api.myptv.com/rastermaps/v1/image-tiles/{z}/{x}/{y}';

const defaultCenter: [number, number] = [47.20039821242735, 7.971962392330171];

const TrackingMapDisplay = ({
	iconCache,
	pointFeatures,
	polygonFeatures,
	tileOptions,
	defaultIconUrl,
	center,
	urlTemplate,
}: EagTrackingMapProps) => {
	const mapRef = useRef<L.Map | undefined>(undefined);
	const mapContainerRef = useRef<HTMLDivElement | null>(null);
	const iconCacheRef = useRef<EagIconCache | undefined>(undefined);

	const layerRef = useRef<PointLayer | undefined>(undefined);
	const polygonLayerRef = useRef<PolygonLayer | undefined>(undefined);

	// Map INIT
	useEffect(() => {
		if (!mapContainerRef.current) return;

		// 1. Init map
		const map = L.map(mapContainerRef.current, {
			...tileOptions,
			zoomControl: true,
			preferCanvas: true,
			fadeAnimation: false,
		}).setView(center ?? defaultCenter, 8);
		mapRef.current = map;

		L.tileLayer(urlTemplate ?? defaultUrlTemplate, {
			maxZoom: 19,
		}).addTo(map);

		// 2. init polygon
		polygonLayerRef.current = new PolygonLayer(map);
		polygonLayerRef.current.updateZones(polygonFeatures ?? []);

		// 3. Preload icon list
		preLoadListIcons(iconCache).then((cache) => {
			iconCacheRef.current = cache;

			// 3.1 Init truck layer (With empty data first)
			const pointLayer = new PointLayer(defaultIconUrl).addTo(map);
			pointLayer.setData(pointFeatures ?? []);
			pointLayer.start();

			layerRef.current = pointLayer;
		});

		// Cleanup on unmount
		return () => {
			map.remove();
			if (layerRef.current) layerRef.current.remove();
			if (polygonLayerRef.current) polygonLayerRef.current.hideZones();
		};
		// eslint-disable-next-line react-hooks/exhaustive-deps
	}, []);

	// effect for Points
	useEffect(() => {
		if (!layerRef.current) return;
		layerRef.current.setData(pointFeatures ?? []);
	}, [pointFeatures]);

	// effect for Polygons
	useEffect(() => {
		if (!polygonLayerRef.current) return;
		polygonLayerRef.current.updateZones(polygonFeatures ?? []);
	}, [polygonFeatures]);

	return <div id="map" ref={mapContainerRef} style={{ width: '100%', height: '100vh' }} />;
};

export default TrackingMapDisplay;
