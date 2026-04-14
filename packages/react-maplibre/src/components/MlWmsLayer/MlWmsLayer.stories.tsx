import Button from '@mui/material/Button';
import { useState } from 'react';
import mapContextDecorator from '../../decorators/MapContextDecorator';
import TopToolbar from '../../ui_components/TopToolbar';
import MlWmsLayer from './MlWmsLayer';

import '../../App.css';

const storyoptions = {
	title: 'MapComponents/MlWmsLayer',
	component: MlWmsLayer,
	argTypes: {
		url: {},
		layer: {},
	},
	decorators: mapContextDecorator,
};
export default storyoptions;

const Template: any = (Story: any, context: any) => {
	const [showLayer, setShowLayer] = useState(true);

	return (
		<>
			<TopToolbar
				unmovableButtons={
					<Button
						color="primary"
						variant={showLayer ? 'contained' : 'outlined'}
						onClick={() => setShowLayer(!showLayer)}
					>
						WMS
					</Button>
				}
			/>
			<MlWmsLayer
				visible={showLayer}
				url={context.args.url}
				urlParameters={context.args.urlParameters}
			/>{' '}
		</>
	);
};

export const ExampleConfig = Template.bind({});
ExampleConfig.parameters = {};
ExampleConfig.args = {
	url: 'https://www.wms.nrw.de/geobasis/wms_nw_uraufnahme',
	urlParameters: {
		layers: 'nw_uraufnahme_rw',
	},
};
//
