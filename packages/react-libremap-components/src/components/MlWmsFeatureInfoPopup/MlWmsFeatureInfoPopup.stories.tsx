import mapContextDecorator from '../../decorators/MapContextDecorator';
import MlWmsFeatureInfoPopup from './MlWmsFeatureInfoPopup';

const storyoptions = {
	title: 'MapComponents/MlWmsFeatureInfoPopup',
	component: MlWmsFeatureInfoPopup,
	argTypes: {
		url: {},
		layer: {},
	},
	decorators: mapContextDecorator,
};
export default storyoptions;

const Template: any = () => <MlWmsFeatureInfoPopup />;

export const ExampleConfig = Template.bind({});
ExampleConfig.parameters = {};
ExampleConfig.args = {};
