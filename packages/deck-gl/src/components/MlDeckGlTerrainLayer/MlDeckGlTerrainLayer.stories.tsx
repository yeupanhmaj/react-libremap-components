import mapContextDecorator from '../../decorators/MapContextDecorator';
import MlDeckGlTerrainLayer from './MlDeckGlTerrainLayer';

const storyoptions = {
	title: 'MapComponents/MlDeckGlTerrainLayer',
	component: MlDeckGlTerrainLayer,
	argTypes: {
		wireframe: { control: 'boolean' },
	},
	decorators: mapContextDecorator,
	parameters: {
		mapOptions: {
			zoom: 10,
			pitch: 45,
			center: [11.39, 47.27],
			style: 'https://wms.wheregroup.com/tileserver/style/osm-bright.json',
		},
	},
};
export default storyoptions;

const Template = (args: Record<string, unknown>) => (
	<MlDeckGlTerrainLayer
		// Terrarium elevation tiles (public, no API key required)
		elevationData="https://s3.amazonaws.com/elevation-tiles-prod/terrarium/{z}/{x}/{y}.png"
		elevationDecoder={{
			rScaler: 256,
			gScaler: 1,
			bScaler: 1 / 256,
			offset: -32768,
		}}
		wireframe={args.wireframe as boolean | undefined}
	/>
);

export const ExampleConfig = Template.bind({});
ExampleConfig.parameters = {};
ExampleConfig.args = { wireframe: false };
