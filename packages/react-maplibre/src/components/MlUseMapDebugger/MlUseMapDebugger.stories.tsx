import mapContextDecorator from '../../decorators/MapContextDecorator';
import MlUseMapDebugger, { type MlUseMapDebuggerProps } from './MlUseMapDebugger';

const storyoptions = {
	title: 'MapComponents/MlUseMapDebugger',
	component: MlUseMapDebugger,
	argTypes: {
		url: {},
		layer: {},
	},
	decorators: mapContextDecorator,
};
export default storyoptions;

const Template: any = (props: MlUseMapDebuggerProps) => {
	return (
		<>
			<MlUseMapDebugger {...props} />
		</>
	);
};

export const ExampleConfig = Template.bind({});
ExampleConfig.parameters = {};
ExampleConfig.args = {
	mapId: 'map_1',
};
