import type { Decorator, StoryContext } from '@storybook/react-vite';
import type { ReactElement } from 'react';
import MapLibreMap from '../components/MapLibreMap/MapLibreMap';
import { MapComponentsProvider } from '../index';
import './style.css';

const decorators: Decorator[] = [
	(Story, _context: StoryContext): ReactElement => {
		return (
			<div className="fullscreen_map">
				<MapComponentsProvider>
					<Story />
					<MapLibreMap
						mapId="map_1"
						options={{
							zoom: 12.5,
							center: [7.0851268, 50.73884],
						}}
					/>
				</MapComponentsProvider>
			</div>
		);
	},
];

export default decorators;
