import { MaplibreTerradrawControl, type ModeOptions } from '@watergis/maplibre-gl-terradraw';
import { useEffect, useRef, useState } from 'react';
import useMap from '../useMap';

export type FeatureDrawMode =
	| 'render'
	| 'point'
	| 'marker'
	| 'linestring'
	| 'polygon'
	| 'rectangle'
	| 'circle'
	| 'freehand'
	| 'freehand-linestring'
	| 'angled-rectangle'
	| 'sensor'
	| 'sector'
	| 'select'
	| 'delete-selection'
	| 'delete'
	| 'download';

const defaultDrawModes: FeatureDrawMode[] = [
	'render',
	'point',
	'marker',
	'linestring',
	'polygon',
	'rectangle',
	'circle',
	'freehand',
	'freehand-linestring',
	'angled-rectangle',
	'sensor',
	'sector',
	'select',
	'delete-selection',
	'delete',
	'download',
];

export interface MlFeatureDrawProps {
	/**
	 * Id of the target MapLibre instance in mapContext
	 */
	mapId?: string;
	/**
	 * Id of an existing layer in the mapLibre instance to help specify the layer order
	 * This layer will be visually beneath the layer with the "insertBeforeLayer" id.
	 */
	insertBeforeLayer?: string;
	/**
	 * drawing mode to show
	 */
	modes?: FeatureDrawMode[];
	/**
	 * Options for the drawing mode
	 */
	modeOptions?: ModeOptions;
}

const useFeatureDraw = (props: MlFeatureDrawProps) => {
	const drawControl = useRef<MaplibreTerradrawControl | null>(null);
	const [isControlReady, setIsControlReady] = useState(false);
	// Always holds the latest color without needing to re-create the control

	const mapHook = useMap({
		mapId: props.mapId,
		waitForLayer: props.insertBeforeLayer,
	});

	// init the terradraw control and add it to the map
	useEffect(() => {
		// if there is no map instance yet, do nothing
		if (!mapHook.map) return;

		if (!drawControl.current) {
			const teraDrawControl = new MaplibreTerradrawControl({
				open: true,
				modes: props.modes || defaultDrawModes,
				modeOptions: props.modeOptions,
			});

			mapHook.map.addControl(teraDrawControl, 'top-left');
			drawControl.current = teraDrawControl;

			setIsControlReady(true);
		}

		return () => {
			if (drawControl.current) {
				mapHook.map?.removeControl(drawControl.current as any);
				drawControl.current = null;
				setIsControlReady(false);
			}
		};
	}, [mapHook.map, props.modes, props.modeOptions]);

	return {
		drawControl: drawControl.current,
		isControlReady,
	};
};

export default useFeatureDraw;
