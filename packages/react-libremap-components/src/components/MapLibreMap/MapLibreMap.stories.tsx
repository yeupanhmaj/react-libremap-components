import type { StoryFn } from '@storybook/react-vite';
import type { FeatureCollection } from 'geojson';
import { useState } from 'react';
import themeDecorator from '../../decorators/ThemeDecorator';
import sample_geojson_1 from '../MlGeoJsonLayer/assets/sample_1.json';
import MlGeoJsonLayer from '../MlGeoJsonLayer/MlGeoJsonLayer';
import MapLibreMap, { type MapLibreMapProps } from './MapLibreMap';

const storyoptions = {
	title: 'Core/MapLibreMap',
	component: MapLibreMap,
	argTypes: {
		options: {
			control: {
				type: 'object',
			},
		},
	},
	decorators: themeDecorator,
	parameters: {
		sourceLink: 'components/MapLibreMap/MapLibreMap.tsx',
	},
};
export default storyoptions;

const Template: StoryFn<MapLibreMapProps> = (args: MapLibreMapProps) => {
	return <MapLibreMap options={{ ...args.options }} />;
};

export const ExampleConfig = Template.bind({});
ExampleConfig.args = {
	options: {
		style: 'https://basemaps.cartocdn.com/gl/voyager-gl-style/style.json',
		center: [8.607, 53.1409349],
		zoom: 14,
	},
};

const StyleChangeTemplate: any = (args: MapLibreMapProps) => {
	return (
		<>
			<MapLibreMap
				options={{
					...args.options,
					style: 'https://basemaps.cartocdn.com/gl/voyager-gl-style/style.json',
				}}
			/>
			<MlGeoJsonLayer type="line" geojson={sample_geojson_1 as FeatureCollection} />
		</>
	);
};

export const StyleChangeConfig = StyleChangeTemplate.bind({});
StyleChangeConfig.args = {
	options: {
		zoom: 14.5,
		center: [7.0851268, 50.73884],
	},
};
StyleChangeConfig.parameters = {};
