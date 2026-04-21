import { MaplibreTerradrawControl, type ModeOptions } from '@watergis/maplibre-gl-terradraw';
import { useCallback, useEffect, useRef, useState } from 'react';
import {
	type GeoJSONStoreFeatures,
	type HexColor,
	TerraDrawAngledRectangleMode,
	TerraDrawCircleMode,
	type TerraDrawExtend,
	TerraDrawFreehandLineStringMode,
	TerraDrawFreehandMode,
	TerraDrawLineStringMode,
	TerraDrawPointMode,
	TerraDrawPolygonMode,
	TerraDrawRectangleMode,
	TerraDrawSectorMode,
	TerraDrawSensorMode,
} from 'terra-draw';
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

export const DEFAULT_FILL_COLOR = '#3b82f6' as HexColor;
export const DEFAULT_OUTLINE_COLOR = '#1e40af' as HexColor;

/**
 * Creates default mode instances with style functions that read per-feature
 * colors from feature.properties.fillColor / feature.properties.outlineColor.
 * User-provided modeOptions override these defaults.
 */
const createDefaultModeOptions = (): ModeOptions => {
	return {
		point: new TerraDrawPointMode({
			styles: {
				pointColor: (f) => (f.properties?.fillColor as HexColor) || DEFAULT_FILL_COLOR,
				pointOpacity: 0.3,
				pointWidth: 2,
				pointOutlineColor: (f) => (f.properties?.outlineColor as HexColor) || DEFAULT_OUTLINE_COLOR,
				pointOutlineOpacity: 0.3,
				pointOutlineWidth: 2,
			},
		}),
		polygon: new TerraDrawPolygonMode({
			styles: {
				fillColor: (f) => (f.properties?.fillColor as HexColor) || DEFAULT_FILL_COLOR,
				fillOpacity: 0.3,
				outlineColor: (f) => (f.properties?.outlineColor as HexColor) || DEFAULT_OUTLINE_COLOR,
				outlineOpacity: 0.3,
				outlineWidth: 2,
			},
		}),
		linestring: new TerraDrawLineStringMode({
			styles: {
				lineStringColor: (f) => (f.properties?.outlineColor as HexColor) || DEFAULT_OUTLINE_COLOR,
				lineStringOpacity: 1,
				lineStringWidth: 2,
			},
		}),
		rectangle: new TerraDrawRectangleMode({
			styles: {
				fillColor: (f) => (f.properties?.fillColor as HexColor) || DEFAULT_FILL_COLOR,
				fillOpacity: 0.3,
				outlineColor: (f) => (f.properties?.outlineColor as HexColor) || DEFAULT_OUTLINE_COLOR,
				outlineOpacity: 0.3,
				outlineWidth: 2,
			},
		}),
		circle: new TerraDrawCircleMode({
			styles: {
				fillColor: (f) => (f.properties?.fillColor as HexColor) || DEFAULT_FILL_COLOR,
				fillOpacity: 0.3,
				outlineColor: (f) => (f.properties?.outlineColor as HexColor) || DEFAULT_OUTLINE_COLOR,
				outlineOpacity: 0.3,
				outlineWidth: 2,
			},
		}),
		freehand: new TerraDrawFreehandMode({
			styles: {
				fillColor: (f) => (f.properties?.fillColor as HexColor) || DEFAULT_FILL_COLOR,
				fillOpacity: 0.3,
				outlineColor: (f) => (f.properties?.outlineColor as HexColor) || DEFAULT_OUTLINE_COLOR,
				outlineOpacity: 0.3,
				outlineWidth: 2,
			},
		}),
		'freehand-linestring': new TerraDrawFreehandLineStringMode({
			styles: {
				lineStringColor: (f) => (f.properties?.outlineColor as HexColor) || DEFAULT_OUTLINE_COLOR,
				lineStringOpacity: 0.3,
				lineStringWidth: 2,
			},
		}),
		'angled-rectangle': new TerraDrawAngledRectangleMode({
			styles: {
				fillColor: (f) => (f.properties?.fillColor as HexColor) || DEFAULT_FILL_COLOR,
				fillOpacity: 0.3,
				outlineColor: (f) => (f.properties?.outlineColor as HexColor) || DEFAULT_OUTLINE_COLOR,
				outlineOpacity: 0.3,
				outlineWidth: 2,
			},
		}),
		sector: new TerraDrawSectorMode({
			styles: {
				fillColor: (f) => (f.properties?.fillColor as HexColor) || DEFAULT_FILL_COLOR,
				fillOpacity: 0.3,
				outlineColor: (f) => (f.properties?.outlineColor as HexColor) || DEFAULT_OUTLINE_COLOR,
				outlineOpacity: 0.3,
				outlineWidth: 2,
			},
		}),
		sensor: new TerraDrawSensorMode({
			styles: {
				centerPointColor: (f) => (f.properties?.fillColor as HexColor) || DEFAULT_FILL_COLOR,
				centerPointOpacity: 0.3,
				centerPointWidth: 2,
				centerPointOutlineColor: (f) =>
					(f.properties?.outlineColor as HexColor) || DEFAULT_OUTLINE_COLOR,
				centerPointOutlineOpacity: 0.3,
				centerPointOutlineWidth: 2,
				fillColor: (f) => (f.properties?.fillColor as HexColor) || DEFAULT_FILL_COLOR,
				fillOpacity: 0.3,
				outlineColor: (f) => (f.properties?.outlineColor as HexColor) || DEFAULT_OUTLINE_COLOR,
				outlineOpacity: 0.3,
				outlineWidth: 2,
			},
		}),
	};
};

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
	 * Options for the drawing mode – passed to individual TerraDrawMode instances.
	 * These override the default styled mode instances.
	 */
	modeOptions?: ModeOptions;
}

const useFeatureDraw = (props: MlFeatureDrawProps) => {
	const drawControl = useRef<MaplibreTerradrawControl | null>(null);
	const [isControlReady, setIsControlReady] = useState(false);
	const [selectedFeatureId, setSelectedFeatureId] = useState<TerraDrawExtend.FeatureId | null>(
		null
	);
	const [selectedFeature, setSelectedFeature] = useState<GeoJSONStoreFeatures | null>(null);

	const mapHook = useMap({
		mapId: props.mapId,
		waitForLayer: props.insertBeforeLayer,
	});

	// ── Init the control ────────────────────────────────────────────────────
	useEffect(() => {
		if (!mapHook.map) return;

		if (!drawControl.current) {
			// Default styled modes + any user overrides
			const mergedModeOptions: ModeOptions = {
				...createDefaultModeOptions(),
				...props.modeOptions,
			};

			const teraDrawControl = new MaplibreTerradrawControl({
				open: true,
				modes: props.modes || defaultDrawModes,
				modeOptions: mergedModeOptions,
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

	// ── Listen to select / deselect events ──────────────────────────────────
	useEffect(() => {
		if (!isControlReady || !drawControl.current) return;

		const drawInstance = drawControl.current.getTerraDrawInstance();
		if (!drawInstance) return;

		const handleSelect = (id: TerraDrawExtend.FeatureId) => {
			setSelectedFeatureId(id);
			const feature = drawInstance.getSnapshotFeature(id);
			setSelectedFeature(feature ?? null);
		};

		const handleDeselect = (_id: TerraDrawExtend.FeatureId) => {
			setSelectedFeatureId(null);
			setSelectedFeature(null);
		};

		drawInstance.on('select', handleSelect);
		drawInstance.on('deselect', handleDeselect);

		return () => {
			drawInstance.off('select', handleSelect);
			drawInstance.off('deselect', handleDeselect);
		};
	}, [isControlReady]);

	// ── Update a feature's fill / outline color ──────────────────────────────
	const updateFeatureColor = useCallback(
		(id: TerraDrawExtend.FeatureId, fillColor?: string, outlineColor?: string) => {
			if (!drawControl.current) return;
			const drawInstance = drawControl.current.getTerraDrawInstance();
			if (!drawInstance) return;

			const update: Record<string, string> = {};
			if (fillColor !== undefined) update.fillColor = fillColor;
			if (outlineColor !== undefined) update.outlineColor = outlineColor;

			drawInstance.updateFeatureProperties(id, update);

			// Refresh the selected feature snapshot so the panel reflects changes
			const updated = drawInstance.getSnapshotFeature(id);
			setSelectedFeature(updated ?? null);
		},
		[]
	);

	return {
		drawControl: drawControl.current,
		isControlReady,
		selectedFeatureId,
		selectedFeature,
		updateFeatureColor,
	};
};

export default useFeatureDraw;
