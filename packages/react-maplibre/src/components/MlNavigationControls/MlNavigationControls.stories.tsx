import noNavToolsDecorator from '../../decorators/NoNavToolsDecorator';
import MlNavigationControls, { type MlNavigationControlsProps } from './MlNavigationControls';

const storyoptions = {
	title: 'MapComponents/MlNavigationControls',
	component: MlNavigationControls,

	argTypes: {
		url: {},
		layer: {},
	},
	decorators: noNavToolsDecorator,
};
export default storyoptions;

const Template: any = (props: MlNavigationControlsProps) => <MlNavigationControls {...props} />;

export const DefaultConfig = Template.bind({});
DefaultConfig.parameters = {};
DefaultConfig.args = {};
