import type { SxProps } from '@mui/material';
import { FullscreenControl, NavigationControl } from 'maplibre-gl';
import { useEffect } from 'react';
import useMap from '../../hooks/useMap';

export interface MlNavigationControlsProps {
	/**
	 * Id of the target MapLibre instance in mapContext
	 */
	mapId?: string;
	/**
	 * The layerId of an existing layer this layer should be rendered visually beneath
	 * https://maplibre.org/maplibre-gl-js-docs/api/map/#map#addlayer - see "beforeId" property
	 */
	insertBeforeLayer?: string;
	/**
	 * Style attribute for NavigationTools container
	 */
	sx?: SxProps;
	/**
	 * Style attribute for NavigationTools container
	 */
	mediaIsMobile?: boolean;
}

/**
 * @component
 */
const MlNavigationControls = (props: MlNavigationControlsProps) => {
	const mapHook = useMap({
		mapId: props.mapId,
		waitForLayer: props.insertBeforeLayer,
	});

	useEffect(() => {
		const navigationControl = new NavigationControl({
			visualizePitch: true,
			visualizeRoll: true,
			showZoom: true,
			showCompass: true,
		});

		const fullscreenControl = new FullscreenControl();

		if (mapHook.map) {
			mapHook.map.addControl(navigationControl);
			mapHook.map.addControl(fullscreenControl);
		}

		return () => {
			if (mapHook.map) {
				mapHook.map.removeControl(navigationControl);
				mapHook.map.removeControl(fullscreenControl);
			}
		};
	}, [mapHook.map]);

	return null;
};

export default MlNavigationControls;
