import '@watergis/maplibre-gl-terradraw/dist/maplibre-gl-terradraw.css';
import type React from 'react';
import { useEffect } from 'react';
import type { GeoJSONStoreFeatures, GeoJSONStoreGeometries, HexColor } from 'terra-draw';
import useFeatureDraw from '../../hooks/useFeatureDraw/useFeatureDraw';

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

export interface MlFeatureDrawProps {
	/**
	 * Id of the target MapLibre instance in mapContext
	 */
	mapId?: string;
	/**
	 * Id of an existing layer in the mapLibre instance to help specify the layer order.
	 * This layer will be visually beneath the layer with the "insertBeforeLayer" id.
	 */
	insertBeforeLayer?: string;
	/**
	 * Initial GeoJSON data to be loaded into the feature draw component.
	 */
	geojson?: GeoJSONStoreFeatures<GeoJSONStoreGeometries>[];
	/**
	 * Callback fired once when the user finishes drawing a single feature.
	 * Receives the completed feature with the active color stamped onto its properties.
	 */
	onFinish?: (feature: GeoJSONStoreFeatures<GeoJSONStoreGeometries>[]) => void;
	/**
	 * Drawing modes to expose in the toolbar.
	 */
	modes?: FeatureDrawMode[];
	/**
	 * Callback triggered when the "Show instructions" checkbox is toggled.
	 */
	onShowInstructionChange?: (value: boolean) => void;
	/**
	 * Style attribute for the container.
	 */
	mediaIsMobile?: boolean;
}

// ---------------------------------------------------------------------------
// Module-level helpers (no component state dependencies)
// ---------------------------------------------------------------------------

/**
 * Builds the Terra Draw style-options object from a per-feature color callback.
 * Defined outside the component so it is never recreated on each render.
 */
export const makeStyles = (colorForFeature: (f: GeoJSONStoreFeatures) => HexColor) => ({
	lineStringColor: colorForFeature,
	fillColor: colorForFeature,
	outlineColor: colorForFeature,
	lineStringWidth: 2,
	outlineWidth: 2,
	opacity: 0.1,
});

// ---------------------------------------------------------------------------

/**
 * A React component that wraps the Terra Draw feature drawing control.
 * For more details, see the Terra Draw documentation.
 * If you want to access deeper into the Terra Draw instance use useFeatureDraw hook instead.
 *
 * This component only provides a simple draw function and a onFinish callback.
 */
const MlFeatureDraw: React.FC<MlFeatureDrawProps> = (props) => {
	const { drawControl } = useFeatureDraw({ ...props });

	useEffect(() => {
		if (!drawControl) return;

		const drawInstance = drawControl.getTerraDrawInstance();
		if (!drawInstance) return;

		const handleFinish = (_id: string | number) => {
			const snapshot = drawInstance
				.getSnapshot()
				.filter((f) => !f.properties.selectionPoint)
				.map((f) => {
					return {
						...f,
						properties: {
							...f.properties,
						},
					};
				});

			props.onFinish?.(snapshot);
		};

		drawInstance.on('finish', handleFinish);

		return () => {
			drawInstance.off('finish', handleFinish);
		};
	}, [drawControl, props.onFinish]);

	useEffect(() => {
		if (!drawControl) return;

		const drawInstance = drawControl.getTerraDrawInstance();
		if (!drawInstance?.enabled) drawControl.activate();
		if (!drawInstance) return;

		const incoming = props.geojson ?? [];

		// Exclude Terra Draw's own internal helper features from the diff.
		const currentSnapshot = drawInstance
			.getSnapshot()
			.filter((f) => !f.properties?.selectionPoint && !f.properties?.midPoint);

		const currentIds = new Set(currentSnapshot.map((f) => String(f.id)));
		const incomingIds = new Set(incoming.map((f) => String(f.id)));

		// Remove features that are no longer present in props.geojson.
		const toRemove = currentSnapshot
			.filter((f) => !incomingIds.has(String(f.id)) && f.id !== undefined)
			.map((f) => f.id as string | number);

		if (toRemove.length > 0) {
			drawInstance.removeFeatures(toRemove);
		}

		// Add features that are not yet in Terra Draw's store.
		const toAdd = incoming.filter((f) => !currentIds.has(String(f.id)));

		if (toAdd.length > 0) {
			drawInstance.addFeatures(toAdd);
		}
	}, [drawControl, props.geojson]);

	return <></>;
};

export default MlFeatureDraw;
