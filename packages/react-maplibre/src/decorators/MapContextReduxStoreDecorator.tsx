import { type FC, type ReactElement, useMemo } from 'react';
import MapLibreMap, { type MapLibreMapProps } from '../components/MapLibreMap/MapLibreMap';
import { MapComponentsProvider } from '../index';
import './style.css';
import { ThemeProvider as MUIThemeProvider } from '@mui/material/styles';
import type { Decorator } from '@storybook/react-vite';
import { Provider as ReduxStoreProvider } from 'react-redux';
import MlNavigationTools from '../components/MlNavigationTools/MlNavigationTools';
import store from '../stores/map.store';
import getTheme from '../ui_components/MapcomponentsTheme';

interface StoryContext {
	globals: {
		theme?: 'dark' | 'light';
	};
}

const makeMapContextDecorators = (options: MapLibreMapProps['options']): Decorator[] => {
	return [
		(Story: FC, context?: StoryContext): ReactElement => {
			const theme = useMemo(() => getTheme(context?.globals?.theme), [context?.globals?.theme]);

			return (
				<div className="fullscreen_map">
					<MapComponentsProvider>
						<ReduxStoreProvider store={store}>
							<MUIThemeProvider theme={theme}>
								<Story />
								<MapLibreMap
									options={{
										zoom: 12.5,
										style: 'https://wms.wheregroup.com/tileserver/style/osm-bright.json',
										center: [7.0851268, 50.73884],
										...(options ? { ...options } : {}),
									}}
									mapId="map_1"
								/>
								<MlNavigationTools showZoomButtons={false} mapId="map_1" />
							</MUIThemeProvider>
						</ReduxStoreProvider>
					</MapComponentsProvider>
				</div>
			);
		},
	];
};

export default makeMapContextDecorators({});
export { makeMapContextDecorators };
