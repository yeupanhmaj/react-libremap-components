import { useState } from 'react';
import lowZoomDecorator from '../../decorators/LowZoomDecorator';
import MlZoomButton, { type MlZoomButtonProps } from './MlZoomButton';

const storyoptions = {
	title: 'MapComponents/MlZoomButton',
	component: MlZoomButton,
	argTypes: {},
	decorators: lowZoomDecorator,
};
export default storyoptions;

const Template: any = (props: MlZoomButtonProps) => {
	const [zoomLevel, setZoomLevel] = useState<number | undefined>(undefined);
	console.log(zoomLevel);

	return (
		<MlZoomButton
			{...props}
			onZoomEnd={(zoomLevel) => {
				setZoomLevel(zoomLevel);
			}}
		/>
	);
};

export const Zoom = Template.bind({});
Zoom.parameters = {};
Zoom.args = {
	style: {
		position: 'absolute',
		transform: 'scale(5)',
		left: '50%',
		top: '60%',
	},
};
