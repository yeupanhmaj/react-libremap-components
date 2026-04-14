import { Button } from '@mui/material';
import { useEffect, useState } from 'react';
import mapContextDecorator from '../../decorators/MapContextDecorator';
import useGpx, { type MetadataType } from '../../hooks/useGpx/useGpx';
import useMap from '../../hooks/useMap';
import Dropzone from '../../ui_components/Dropzone';
import Sidebar from '../../ui_components/Sidebar';
import TopToolbar from '../../ui_components/TopToolbar';
import UploadButton from '../../ui_components/UploadButton';
import MlGpxViewer from '../MlGpxViewer/MlGpxViewer';
import Metadata from '../MlGpxViewer/util/Metadata';
import MlGpxDemoLoader from '../MlGpxViewer/util/MlGpxDemoLoader';
import MlGpxViewerInstructions from '../MlGpxViewer/util/MlGpxViewerInstructions';
import MlSpatialElevationProfile from './MlSpatialElevationProfile';

const storyoptions = {
	title: 'MapComponents/MlSpatialElevationProfile',
	component: MlSpatialElevationProfile,
	argTypes: {
		options: {
			control: {
				type: 'object',
			},
		},
	},
	decorators: mapContextDecorator,
};
export default storyoptions;

const Template: any = () => {
	const [gpxData, setGpxData] = useState<string | undefined>();
	const parsedGpx = useGpx({ data: gpxData });
	const [demoLoaderOpen, setDemoLoaderOpen] = useState(false);
	const [guide, setGuide] = useState(false);
	const [metadata, setMetadata] = useState<MetadataType[]>([]);
	const mapHook = useMap({ mapId: 'map_1' });
	const [openSidebar, setOpenSidebar] = useState(true);

	const handleClick1 = () => {
		setDemoLoaderOpen(!demoLoaderOpen);
	};

	const handleClick2 = () => {
		setGuide(true);
		setTimeout(() => {
			setGuide(false);
		}, 9000);
	};
	useEffect(() => {
		if (!mapHook.map) return;
		if (mapHook.map.map.getPitch() != 60) {
			mapHook.map.map.setPitch(60);
		}
	}, [mapHook.map]);

	return (
		<>
			<MlGpxViewerInstructions open={guide} />
			<TopToolbar
				buttons={
					<>
						<Button
							variant={openSidebar ? 'contained' : 'outlined'}
							onClick={() => setOpenSidebar(!openSidebar)}
							sx={{ marginRight: { xs: '0px', sm: '10px' } }}
						>
							Informations
						</Button>
						<br />
						<br />
						<UploadButton
							setData={setGpxData}
							buttonComponent={
								<Button variant="contained" sx={{ marginRight: { xs: '0px', sm: '10px' } }}>
									Upload
								</Button>
							}
						/>
						<br />
						<br />
						<Button
							variant="contained"
							onClick={handleClick1}
							sx={{ marginRight: { xs: '0px', sm: '10px' } }}
						>
							Demo Mode
						</Button>
						<br />
						<br />
						<Button variant="contained" onClick={handleClick2} sx={{ display: 'none' }}>
							Guide me through
						</Button>
					</>
				}
			/>
			<MlGpxDemoLoader
				open={demoLoaderOpen}
				close={() => setDemoLoaderOpen(false)}
				setGpx={setGpxData}
			/>

			<Sidebar open={openSidebar} setOpen={setOpenSidebar} name={'GPX Informations'}>
				<Metadata metadata={metadata} />
			</Sidebar>
			<Dropzone setData={(data) => setGpxData(data)} />
			<MlGpxViewer
				gpxData={gpxData}
				onParseGpxData={(parsedGpx) => setMetadata(parsedGpx.metadata ? parsedGpx.metadata : [])}
			/>
			<MlSpatialElevationProfile geojson={parsedGpx.geojson} />
		</>
	);
};

export const ExampleConfig = Template.bind({});
ExampleConfig.parameters = {};
