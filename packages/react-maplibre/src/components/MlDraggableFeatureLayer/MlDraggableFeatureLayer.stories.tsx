import { type FC, useState } from 'react';
import mapContextDecorator from '../../decorators/MapContextDecorator';
import MlDraggableFeatureLayer from './MlDraggableFeatureLayer';

const storyoptions = {
	title: 'MapComponents/MlDraggableFeatureLayer',
	component: MlDraggableFeatureLayer,
	argTypes: {},
	decorators: mapContextDecorator,
};
export default storyoptions;

const Template: FC = () => {
	const [position, setPosition] = useState<[number, number]>([7.0851, 50.7388]);

	return (
		<>
			<div
				style={{
					position: 'absolute',
					top: 10,
					left: 10,
					zIndex: 1000,
					background: 'white',
					padding: '8px 12px',
					borderRadius: 4,
					fontSize: 13,
				}}
			>
				lng: {position[0].toFixed(5)}, lat: {position[1].toFixed(5)}
			</div>
			<MlDraggableFeatureLayer
				iconSrc="assets/marker.png"
				lnglat={[7.0851, 50.7388]}
				onDragEnd={setPosition}
			/>
		</>
	);
};

export const ExampleConfig = Template.bind({});
