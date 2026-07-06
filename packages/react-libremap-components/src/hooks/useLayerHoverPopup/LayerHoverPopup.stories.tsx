import mapContextDecorator from '../../decorators/MapContextDecorator';
import LayerHoverPopup from './LayerHoverPopup';

const storyoptions = {
	title: 'Hooks/LayerHoverPopup',
	component: LayerHoverPopup,
	argTypes: {},
	decorators: mapContextDecorator,
};
export default storyoptions;

const Template: any = () => {
	return (
		<>
			<LayerHoverPopup getPopupContent={() => 'Popup content'} />
		</>
	);
};

export const ExampleConfig = Template.bind({});
ExampleConfig.parameters = {};
ExampleConfig.args = {};
