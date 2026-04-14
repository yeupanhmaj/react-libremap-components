import AddIcon from '@mui/icons-material/Add';
import RemoveIcon from '@mui/icons-material/Remove';
import { Button, ButtonGroup, Divider, Paper, useTheme } from '@mui/material';
import { type CSSProperties, useCallback, useEffect } from 'react';
import useMap from '../../hooks/useMap';

export interface MlZoomButtonProps {
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
	 * Style object to adjust css definitions of the component.
	 */
	style?: CSSProperties;
	/**
	 * Callback function that is called when the zoom ends.
	 * @param zoom The current zoom level.
	 */
	onZoomEnd?: (zoomLevel?: number) => void;
}

const MlZoomButton = (props: MlZoomButtonProps) => {
	const mapHook = useMap({
		mapId: props.mapId,
		waitForLayer: props.insertBeforeLayer,
	});

	const theme = useTheme();

	useEffect(() => {
		if (!mapHook.map) return;

		mapHook.map.on('zoomend', () => {
			const zoomeLevel = mapHook.map?.getZoom();
			props.onZoomEnd?.(zoomeLevel);
		});

		return () => {
			if (!mapHook.map) return;
			mapHook.map.off('zoomend', () => {
				const zoomeLevel = mapHook.map?.getZoom();
				props.onZoomEnd?.(zoomeLevel);
			});
		};
	}, [mapHook.map, props.onZoomEnd]);

	const zoomIn = useCallback(() => {
		if (!mapHook.map) return;

		mapHook.map.easeTo({ zoom: mapHook.map.getZoom() + 0.5 });
	}, [mapHook.map]);

	const zoomOut = useCallback(() => {
		if (!mapHook.map) return;

		mapHook.map.easeTo({ zoom: mapHook.map.getZoom() - 0.5 });
	}, [mapHook.map]);

	return (
		<ButtonGroup
			orientation="vertical"
			sx={{
				border: 'none',
				Button: { minWidth: '20px !important', color: theme.palette.navigation.buttonColor },
				'Button:hover': { border: 'none' },
			}}
		>
			<Button
				variant="navtools"
				onClick={zoomIn}
				sx={{
					borderBottomLeftRadius: 0,
					borderBottomRightRadius: 0,
					position: 'relative',
				}}
			>
				<AddIcon sx={{ fontSize: { xs: '1.4em', md: '1em' } }} />
			</Button>
			<Paper
				sx={{
					backgroundColor: '#fff',
				}}
			>
				<Divider
					sx={{
						marginLeft: '4px',
						marginRight: '4px',
					}}
				/>
			</Paper>

			<Button
				variant="navtools"
				onClick={zoomOut}
				sx={{
					marginTop: 0,
					borderTopLeftRadius: 0,
					borderTopRightRadius: 0,
				}}
			>
				<RemoveIcon sx={{ fontSize: { xs: '1.4em', md: '1em' } }} />
			</Button>
		</ButtonGroup>
	);
};
export default MlZoomButton;
