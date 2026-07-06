//TODO:This component will convert to center marker of MlMarker
// and add a circular layer to indicate the drag zone.
// It will also handle the drag interactions and call the onDragEnd
// callback with the new coordinates when dragging is finished.
import type { GeoJSONSource, Map, MapMouseEvent } from 'maplibre-gl';
import { useCallback, useEffect, useRef } from 'react';
import { v4 as uuidv4 } from 'uuid';
import useMap from '../../hooks/useMap';

export interface MlDraggableFeatureLayerProps {
	/**
	 * Id of the target MapLibre instance in mapContext
	 */
	mapId?: string;
	/**
	 * URL of the icon image to display at the draggable marker position
	 */
	iconSrc: string;
	/**
	 * Initial [longitude, latitude] position of the draggable feature
	 */
	lnglat: [number, number];
	/**
	 * Radius of the circular drag interaction zone in pixels
	 * @default 100
	 */
	radius?: number;
	/**
	 * MapLibre paint properties for the draggable zone circle layer
	 */
	paint?: Record<string, unknown>;
	/**
	 * Callback fired when the user finishes dragging, with the new [longitude, latitude] position
	 */
	onDragEnd?: (lnglat: [number, number]) => void;
}

const MlDraggableFeatureLayer = (props: MlDraggableFeatureLayerProps) => {
	const mapHook = useMap({ mapId: props.mapId });

	const uid = useRef(uuidv4());
	const sourceId = useRef('draggable-source-' + uid.current);
	const dragZoneLayerId = useRef('draggable-zone-' + uid.current);
	const iconLayerId = useRef('draggable-icon-' + uid.current);
	const imageId = useRef('draggable-image-' + uid.current);
	const initialized = useRef(false);
	const coordsRef = useRef<[number, number]>(props.lnglat);
	const onDragEndRef = useRef(props.onDragEnd);
	onDragEndRef.current = props.onDragEnd;

	const onMove = useCallback(
		(e: MapMouseEvent) => {
			if (!mapHook.map) return;
			const nativeMap: Map = mapHook.map.map;
			const coords: [number, number] = [e.lngLat.lng, e.lngLat.lat];
			coordsRef.current = coords;
			nativeMap.getCanvas().style.cursor = 'grabbing';
			(nativeMap.getSource(sourceId.current) as GeoJSONSource).setData({
				type: 'FeatureCollection',
				features: [
					{
						type: 'Feature',
						geometry: { type: 'Point', coordinates: coords },
						properties: {},
					},
				],
			});
		},
		[mapHook.map]
	);

	const onUp = useCallback(
		(_e: MapMouseEvent) => {
			if (!mapHook.map) return;
			const nativeMap: Map = mapHook.map.map;
			nativeMap.getCanvas().style.cursor = '';
			nativeMap.off('mousemove', onMove);
			nativeMap.off('touchmove', onMove);
			onDragEndRef.current?.(coordsRef.current);
		},
		[mapHook.map, onMove]
	);

	useEffect(() => {
		if (!mapHook.map || initialized.current) return;
		const map = mapHook.map;
		const nativeMap: Map = mapHook.map.map;
		initialized.current = true;

		map.loadImage(props.iconSrc).then((res) => {
			if (!res?.data) {
				console.error('MlDraggableFeatureLayer: failed to load icon image from', props.iconSrc);
				return;
			}

			if (!nativeMap.hasImage(imageId.current)) {
				map.addImage(imageId.current, res.data as unknown as ImageData, mapHook.componentId);
			}

			map.addSource(
				sourceId.current,
				{
					type: 'geojson',
					data: {
						type: 'FeatureCollection',
						features: [
							{
								type: 'Feature',
								geometry: { type: 'Point', coordinates: props.lnglat },
								properties: {},
							},
						],
					},
				},
				mapHook.componentId
			);

			map.addLayer(
				{
					id: dragZoneLayerId.current,
					type: 'circle',
					source: sourceId.current,
					paint: (props.paint as Record<string, unknown>) ?? {
						'circle-radius': props.radius ?? 100,
						'circle-color': 'rgb(56,135,190)',
						'circle-opacity': 0.3,
					},
				},
				undefined,
				mapHook.componentId
			);

			map.addLayer(
				{
					id: iconLayerId.current,
					type: 'symbol',
					source: sourceId.current,
					layout: {
						'icon-image': imageId.current,
						'icon-size': 0.3,
					},
				},
				undefined,
				mapHook.componentId
			);

			nativeMap.on('mouseenter', dragZoneLayerId.current, () => {
				nativeMap.setPaintProperty(dragZoneLayerId.current, 'circle-color', 'rgba(59,178,208,0.5)');
				nativeMap.getCanvas().style.cursor = 'move';
			});

			nativeMap.on('mouseleave', dragZoneLayerId.current, () => {
				nativeMap.setPaintProperty(dragZoneLayerId.current, 'circle-color', 'rgba(56,135,190,0.3)');
				nativeMap.getCanvas().style.cursor = '';
			});

			nativeMap.on('mousedown', dragZoneLayerId.current, (e) => {
				e.preventDefault();
				nativeMap.getCanvas().style.cursor = 'grab';
				nativeMap.on('mousemove', onMove);
				nativeMap.once('mouseup', onUp);
			});
		});
	}, [mapHook.map]);

	return <></>;
};

export default MlDraggableFeatureLayer;
