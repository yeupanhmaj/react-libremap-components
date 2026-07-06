import mapContextDecorator from '../../decorators/MapContextDecorator';
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

const Template: any = (_Story: any, context: any) => {
	return <MlWmsLayer visible url={context.args.url} urlParameters={context.args.urlParameters} />;
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
