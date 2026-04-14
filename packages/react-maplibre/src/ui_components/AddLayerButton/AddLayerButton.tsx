import PlaylistAddIcon from '@mui/icons-material/PlaylistAdd';
import { Button, type SxProps } from '@mui/material';
import React from 'react';
import type { LayerConfig } from '../../contexts/LayerContext';
import AddLayerPopup from './AddLayerPopup';
//import useAddProtocol, { useAddProtocolProps } from '../../hooks/useAddProtocol/useAddProtocol';

//function AddProtocol(props: useAddProtocolProps) {
//	useAddProtocol({
//		protocol: props.protocol,
//		handler: props.handler,
//	});
//	return <></>;
//}
export interface AddLayerButtonProps {
	sx?: SxProps;
	/**
	 * An string array, to filter the supported file types that would be shown to the user
	 * Default is: ['geojson', 'wms', 'csv', 'topojson', 'osm', 'gpx', 'kml', 'tcx']
	 */
	layerTypes?: string[];
	onComplete?: (config: LayerConfig) => void;
}

const AddLayerButton = (props: AddLayerButtonProps) => {
	const [popupOpen, setPopupOpen] = React.useState<boolean>(false);
	const layerTypes = props.layerTypes || [
		'geojson',
		'wms',
		//'mbtiles',
		'csv',
		'topojson',
		'osm',
		'gpx',
		'kml',
		'tcx',
	];

	return (
		<>
			<Button
				variant="contained"
				sx={{ marginTop: '10px', ...props.sx }}
				onClick={() => setPopupOpen(true)}
			>
				<PlaylistAddIcon />
			</Button>
			<AddLayerPopup
				open={popupOpen}
				setOpen={setPopupOpen}
				onComplete={props?.onComplete}
				layerTypes={layerTypes}
			/>
		</>
	);
};

AddLayerButton.defaultProps = {};

export default AddLayerButton;
