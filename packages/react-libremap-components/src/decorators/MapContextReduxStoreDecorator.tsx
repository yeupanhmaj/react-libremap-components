import { type FC, type ReactElement } from 'react';
import MapLibreMap, { type MapLibreMapProps } from '../components/MapLibreMap/MapLibreMap';
import { MapComponentsProvider } from '../index';
import './style.css';
import type { Decorator } from '@storybook/react-vite';
import { Provider as ReduxStoreProvider } from 'react-redux';
import store from '../stores/map.store';

interface StoryContext {
	globals: {
		theme?: 'dark' | 'light';
	};
}

const makeMapContextDecorators = (options: MapLibreMapProps['options']): Decorator[] => {
	return [
		(Story: FC, _context?: StoryContext): ReactElement => {
			return (
				<div className="fullscreen_map">
					<MapComponentsProvider>
						<ReduxStoreProvider store={store}>
							<Story />
							<MapLibreMap
								options={{
									zoom: 12.5,
									style: 'https://basemaps.cartocdn.com/gl/voyager-gl-style/style.json',
									center: [7.0851268, 50.73884],
									...(options ? { ...options } : {}),
								}}
								mapId="map_1"
							/>
						</ReduxStoreProvider>
					</MapComponentsProvider>
				</div>
			);
		},
	];
};

export default makeMapContextDecorators({});
export { makeMapContextDecorators };
