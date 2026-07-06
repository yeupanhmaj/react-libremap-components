import type { Decorator } from '@storybook/react-vite'; // Adjust import based on actual usage
import type { FC, ReactElement } from 'react';
import MapLibreMap from '../components/MapLibreMap/MapLibreMap';
import { MapComponentsProvider } from '../index';
import './style.css';

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
							zoom: 3,
							style: 'https://basemaps.cartocdn.com/gl/voyager-gl-style/style.json',
							center: [4.5424, 39.44518],
						}}
						mapId="map_1"
					/>
				</MapComponentsProvider>
			</div>
		);
	},
];

export default decorators;
