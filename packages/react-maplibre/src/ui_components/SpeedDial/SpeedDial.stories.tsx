import mapContextDecorator from '../../decorators/NoNavToolsDecorator';
import SpeedDial from './SpeedDial';

const storyoptions = {
	title: 'UiComponents/SpeedDial',
	component: SpeedDial,
	argTypes: {},
	decorators: mapContextDecorator,
	parameters: { docs: { source: { type: 'code' } } },
};
export default storyoptions;

const Template: any = () => <SpeedDial />;

export const ExampleConfig = Template.bind({});
ExampleConfig.parameters = {};
ExampleConfig.args = {};
