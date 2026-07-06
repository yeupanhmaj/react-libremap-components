import type { Decorator } from '@storybook/react-vite';
import type { LngLatLike } from 'maplibre-gl';
import { type FC, type ReactElement } from 'react';
import MapLibreMap from '../components/MapLibreMap/MapLibreMap';
import { MapComponentsProvider } from '../index';
import './style.css';

interface StoryContext {
	globals: {
		theme?: 'dark' | 'light';
	};
	name: string;
}

const decorators: Decorator[] = [
	(Story: FC, context?: StoryContext): ReactElement => {
		const storyZoom =
			context &&
			(context.name === 'Heat Map' || context.name === 'Circle' || context.name === 'Symbol')
				? 3
				: 15;
		const storyCenter: LngLatLike =
			context &&
			(context.name === 'Heat Map' || context.name === 'Circle' || context.name === 'Symbol')
				? [4.5424, 39.44518]
				: [7.104418060409521, 50.73394661255866];

		return (
			<div className="fullscreen_map">
				<MapComponentsProvider>
					<Story />
					<MapLibreMap
						options={{
							zoom: storyZoom,
							style: 'https://basemaps.cartocdn.com/gl/voyager-gl-style/style.json',
							center: storyCenter,
						}}
						mapId="map_1"
					/>
				</MapComponentsProvider>
			</div>
		);
	},
];

export default decorators;
