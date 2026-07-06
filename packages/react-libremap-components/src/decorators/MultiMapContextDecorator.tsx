import { type FC, type ReactElement } from 'react';
import MapLibreMap from '../components/MapLibreMap/MapLibreMap';
import { MapComponentsProvider } from '../index';
import './style.css';
import type { Decorator } from '@storybook/react-vite'; // Adjust according to your actual import paths

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
					<div
						style={{
							overflow: 'hidden',
							position: 'absolute',
							top: '0',
							bottom: '0',
							left: '0',
							right: '0',
						}}
					>
						<Story />
						<div className="maps">
							<MapLibreMap
								mapId="map_1"
								options={{
									zoom: 14.5,
									minZoom: 12.5,
									style: 'https://basemaps.cartocdn.com/gl/positron-gl-style/style.json',
									center: [7.0851268, 50.73884],
								}}
							/>
							<MapLibreMap
								mapId="map_2"
								options={{
									zoom: 14.5,
									minZoom: 12.5,
									style: 'https://basemaps.cartocdn.com/gl/voyager-gl-style/style.json',
									center: [7.0851268, 50.73884],
								}}
							/>
						</div>
					</div>
				</MapComponentsProvider>
			</div>
		);
	},
];

export default decorators;
