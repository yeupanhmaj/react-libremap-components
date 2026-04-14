import mapContextDecorator from '../../decorators/MapContextDecorator';
import TopToolbar from '../../ui_components/TopToolbar';
import MlCreatePngButton from './MlCreatePngButton';

const storyoptions = {
	title: 'MapComponents/MlCreatePngButton',
	component: MlCreatePngButton,
	argTypes: {},
	decorators: mapContextDecorator,
};
export default storyoptions;

const Template = () => <TopToolbar unmovableButtons={<MlCreatePngButton />} />;

export const ExampleConfig = Template.bind({});
