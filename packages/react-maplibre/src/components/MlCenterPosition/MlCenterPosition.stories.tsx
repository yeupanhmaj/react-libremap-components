import mapContextDecorator from '../../decorators/MapContextDecorator';
import MlCenterPosition from './MlCenterPosition';

const storyoptions = {
	title: 'MapComponents/MlCenterPosition',
	component: MlCenterPosition,
	argTypes: {},
	decorators: mapContextDecorator,
	parameters: { docs: { source: { type: 'code' } } },
};
export default storyoptions;

const Template: any = () => <MlCenterPosition />;

export const ExampleConfig = Template.bind({});
ExampleConfig.parameters = {};
ExampleConfig.args = {};
