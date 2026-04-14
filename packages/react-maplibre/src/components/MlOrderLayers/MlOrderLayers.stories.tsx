import mapContextDecorator from '../../decorators/MapContextDecorator';
import MlOrderLayers from './MlOrderLayers';

const storyoptions = {
	title: 'MapComponents/MlOrderLayers',
	component: MlOrderLayers,
	argTypes: {},
	decorators: mapContextDecorator,
};
export default storyoptions;

const Template: any = () => <MlOrderLayers layerIds={['layer1', 'layer2']} />;

export const ExampleConfig = Template.bind({});
ExampleConfig.parameters = {};
ExampleConfig.args = {};
