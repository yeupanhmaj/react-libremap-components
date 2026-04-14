import mapContextDecorator from '../../decorators/MapContextDecorator';
import MlGeojsonLayerWithSource from './MlGeojsonLayerWithSource';

const storyoptions = {
	title: 'MapComponents/MlGeojsonLayerWithSource',
	component: MlGeojsonLayerWithSource,
	argTypes: {},
	decorators: mapContextDecorator,
};
export default storyoptions;

const Template: any = () => <MlGeojsonLayerWithSource />;

export const ExampleConfig = Template.bind({});
ExampleConfig.args = { mapId: 'map_1' };
