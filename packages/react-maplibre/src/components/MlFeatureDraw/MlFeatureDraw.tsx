import '@watergis/maplibre-gl-terradraw/dist/maplibre-gl-terradraw.css';
import type React from 'react';
import { useCallback, useEffect } from 'react';
import type { GeoJSONStoreFeatures, GeoJSONStoreGeometries } from 'terra-draw';
import useFeatureDraw, { type FeatureDrawMode } from '../../hooks/useFeatureDraw/useFeatureDraw';
import FeatureColorPanel from './FeatureColorPanel';

export interface MlFeatureDrawProps {
	mapId?: string;
	insertBeforeLayer?: string;
	geojson?: GeoJSONStoreFeatures<GeoJSONStoreGeometries>[];
	onChange?: (feature: GeoJSONStoreFeatures<GeoJSONStoreGeometries>[]) => void;
	modes?: FeatureDrawMode[];
}

const MlFeatureDraw: React.FC<MlFeatureDrawProps> = (props) => {
	const { drawControl, selectedFeature, updateFeatureColor } = useFeatureDraw({ ...props });

	const getCleanSnapshot = useCallback(() => {
		const drawInstance = drawControl?.getTerraDrawInstance();
		if (!drawInstance) return [];
		return drawInstance
			.getSnapshot()
			.filter((f) => !f.properties.selectionPoint && !f.properties.midPoint)
			.map((f) => ({ ...f, properties: { ...f.properties } }));
	}, [drawControl]);

	useEffect(() => {
		if (!drawControl) return;
		const drawInstance = drawControl.getTerraDrawInstance();
		if (!drawInstance) return;

		const handleFinish = (_id: string | number) => {
			props.onChange?.(getCleanSnapshot());
		};
		drawInstance.on('finish', handleFinish);

		return () => {
			drawInstance.off('finish', handleFinish);
		};
	}, [drawControl, props.onChange]);

	useEffect(() => {
		if (!drawControl) return;
		const drawInstance = drawControl.getTerraDrawInstance();
		if (!drawInstance) return;

		const handleChange = (_ids: (string | number)[], type: string) => {
			if (type === 'delete') {
				props.onChange?.(getCleanSnapshot());
			}
		};
		drawInstance.on('change', handleChange);

		return () => {
			drawInstance.off('change', handleChange);
		};
	}, [drawControl, getCleanSnapshot, props.onChange]);

	useEffect(() => {
		if (!drawControl) return;
		const drawInstance = drawControl.getTerraDrawInstance();

		if (!drawInstance?.enabled) drawControl.activate();
		if (!drawInstance) return;

		const incoming = props.geojson ?? [];
		const currentSnapshot = drawInstance
			.getSnapshot()
			.filter((f) => !f.properties?.selectionPoint && !f.properties?.midPoint);
		const currentIds = new Set(currentSnapshot.map((f) => String(f.id)));
		const incomingIds = new Set(incoming.map((f) => String(f.id)));
		const toRemove = currentSnapshot
			.filter((f) => !incomingIds.has(String(f.id)) && f.id !== undefined)
			.map((f) => f.id as string | number);

		if (toRemove.length > 0) drawInstance.removeFeatures(toRemove);

		const toAdd = incoming.filter((f) => !currentIds.has(String(f.id)));
		if (toAdd.length > 0) drawInstance.addFeatures(toAdd);
	}, [drawControl, props.geojson]);

	// After a color update, emit the full snapshot via onFinish so the
	// parent's geoJson state stays in sync with terra-draw's internal store.
	const handleColorChange = useCallback(
		(id: string | number, fillColor?: string, outlineColor?: string) => {
			updateFeatureColor(id, fillColor, outlineColor);
			props.onChange?.(getCleanSnapshot());
		},
		[updateFeatureColor, getCleanSnapshot, props.onChange]
	);

	return (
		<>
			{selectedFeature && (
				<FeatureColorPanel
					feature={selectedFeature}
					onFillColorChange={(id, color) => handleColorChange(id, color, undefined)}
					onOutlineColorChange={(id, color) => handleColorChange(id, undefined, color)}
					onClose={() => {
						const drawInstance = drawControl?.getTerraDrawInstance();
						if (drawInstance) {
							drawInstance.deselectFeature(selectedFeature.id as string | number);
						}
					}}
				/>
			)}
		</>
	);
};

export default MlFeatureDraw;
