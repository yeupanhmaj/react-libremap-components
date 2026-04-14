import type { SxProps, Theme } from '@mui/material';
import Box from '@mui/material/Box';
import Button from '@mui/material/Button';
import useMediaQuery from '@mui/material/useMediaQuery';
import React, { useCallback, useEffect, useState } from 'react';
import useMap from '../../hooks/useMap';
import MlCenterPosition from '../MlCenterPosition/MlCenterPosition';
import MlFollowGps from '../MlFollowGps/MlFollowGps';
import MlGlobeButton from '../MlGlobeButton/MlGlobeButton';
import MlNavigationCompass from '../MlNavigationCompass/MlNavigationCompass';
import MlZoomButton from '../MlZoomButton/MlZoomButton';

export interface MlNavigationToolsProps {
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
	 * Show 3D button
	 */
	show3DButton?: boolean;
	/**
	 * Show global button
	 */
	showGlobeButton?: boolean;
	/**
	 * Show zoom button
	 */
	showZoomButtons?: boolean;
	/**
	 * Show follow GPS button
	 */
	showFollowGpsButton?: boolean;
	/**
	 * Show center on current position button
	 */
	showCenterLocationButton?: boolean;
	/**
	 * Additional JSX Elements to be rendered below MlNavigationTools buttons
	 */
	children?: React.JSX.Element;
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

const MlNavigationTools = (props: MlNavigationToolsProps) => {
	const mapHook = useMap({
		mapId: props.mapId,
		waitForLayer: props.insertBeforeLayer,
	});

	const [pitch, setPitch] = useState(0);
	const mediaIsMobile = useMediaQuery((theme: Theme) => theme.breakpoints.down('md'));

	useEffect(() => {
		if (!mapHook.map) return;

		mapHook.map.on(
			'pitchend',
			() => {
				if (!mapHook.map) return;

				setPitch(mapHook.map.getPitch());
			},
			mapHook.componentId
		);
		setPitch(mapHook.map.getPitch());
	}, [mapHook.map, props.mapId]);

	const adjustPitch = useCallback(() => {
		if (!mapHook.map) return;
		setPitch(mapHook.map.getPitch());
		const targetPitch = mapHook.map.getPitch() !== 0 ? 0 : 60;
		mapHook.map.easeTo({ pitch: targetPitch });
	}, [mapHook.map]);

	return (
		<Box
			sx={{
				zIndex: 501,
				position: 'absolute',
				display: 'flex',
				flexDirection: 'column',
				padding: 1,
				right: mediaIsMobile ? '15px' : '25px',
				bottom: mediaIsMobile ? '20px' : '40px',
				...(mediaIsMobile ? { margin: '80px 10px 50px 10px' } : { marginTop: '50px' }),
				...props.sx,
			}}
		>
			<MlNavigationCompass />
			{props.show3DButton && (
				<Button
					variant="navtools"
					onClick={adjustPitch}
					sx={{ color: (theme) => theme.palette.navigation.buttonColor }}
				>
					{pitch < 29 ? '2D' : '3D'}
				</Button>
			)}
			{props.showGlobeButton && <MlGlobeButton />}
			{props.showFollowGpsButton && <MlFollowGps />}
			{props.showCenterLocationButton && <MlCenterPosition />}
			{props.showZoomButtons && <MlZoomButton />}
			{props.children && React.cloneElement(props.children, {})}
		</Box>
	);
};

export default MlNavigationTools;
