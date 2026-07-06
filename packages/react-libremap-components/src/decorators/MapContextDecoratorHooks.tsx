import type { Decorator } from '@storybook/react-vite';
import type { FC, ReactElement } from 'react';
import MapLibreMap from '../components/MapLibreMap/MapLibreMap';
import { MapComponentsProvider } from '../index';
import './style.css';

const decorators: Decorator[] = [
	(Story: FC): ReactElement => {
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
