import mapContextDecorator from '../../decorators/MapContextDecorator';
import MlComponentTemplate from './MlComponentTemplate';

const storyoptions = {
	title: 'MapComponents/MlComponentTemplate',
	component: MlComponentTemplate,
	argTypes: {},
	decorators: mapContextDecorator,
};
export default storyoptions;

const Template: any = () => <MlComponentTemplate />;

export const ExampleConfig = Template.bind({});
ExampleConfig.parameters = {};
ExampleConfig.args = {};
