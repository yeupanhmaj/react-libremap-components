import mapContextDecorator from '../../decorators/MapContextDecorator';
import MlTextLayer, { type MlTextLayerProps, type TextAnnotation } from './MlTextLayer';

const storyOptions = {
	title: 'MapComponents/MlTextLayer',
	component: MlTextLayer,
	decorators: mapContextDecorator,
	parameters: {
		docs: {
			description: {
				component: [
					'Place, style, and delete text annotations on the map.',
					'',
					'**How to use:**',
					'- **Right-click** anywhere on the map → "Add text".',
					'- Type your label in the floating textarea; press **Enter** or click **Add** to place it.',
					'- **Right-click** an existing annotation → inline style editor to change its colour / font size, or delete it.',
				].join('\n'),
			},
		},
	},
	argTypes: {
		defaultColor: { control: 'color' },
		defaultFontSize: { control: { type: 'range', min: 8, max: 48, step: 1 } },
	},
};

export default storyOptions;

const Template: any = (args: MlTextLayerProps) => <MlTextLayer {...args} mapId="map_1" />;

/** Basic uncontrolled usage – right-click the map to start adding labels. */
export const ExampleConfig = Template.bind({});
ExampleConfig.storyName = 'Example Config';
ExampleConfig.args = {
	defaultColor: '#111827',
	defaultFontSize: 14,
} satisfies MlTextLayerProps;

/** Pre-populated annotations passed as controlled props. */
export const WithInitialAnnotations = Template.bind({});
WithInitialAnnotations.storyName = 'With initial annotations';
WithInitialAnnotations.args = {
	defaultColor: '#111827',
	defaultFontSize: 14,
	annotations: [
		{
			id: 'demo-1',
			longitude: 7.0851268,
			latitude: 50.73884,
			text: 'WhereGroup HQ',
			color: '#2563eb',
			fontSize: 16,
		},
		{
			id: 'demo-2',
			longitude: 7.082,
			latitude: 50.742,
			text: 'Bonn Botanical Garden',
			color: '#16a34a',
			fontSize: 13,
		},
		{
			id: 'demo-3',
			longitude: 7.094,
			latitude: 50.735,
			text: 'Rhein River',
			color: '#dc2626',
			fontSize: 18,
		},
	] as TextAnnotation[],
} satisfies MlTextLayerProps;
