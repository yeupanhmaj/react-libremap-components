import { type FC, type ReactElement } from 'react';
import MapLibreMap from '../components/MapLibreMap/MapLibreMap';
import { MapComponentsProvider } from '../index';
import './style.css';
import type { Decorator } from '@storybook/react-vite';

interface StoryContext {
	globals: {
		theme?: 'dark' | 'light';
	};
}

const decorators: Decorator[] = [
	(Story: FC, _context?: StoryContext): ReactElement => {
		return (
			<div className="fullscreen_map">
				<MapComponentsProvider>
					<Story />
					<MapLibreMap
						options={{
							zoom: 14.5,
							style: 'https://basemaps.cartocdn.com/gl/voyager-gl-style/style.json',
							center: [7.0851268, 50.73884],
						}}
						mapId="map_1"
					/>
				</MapComponentsProvider>
			</div>
		);
	},
];

export default decorators;
