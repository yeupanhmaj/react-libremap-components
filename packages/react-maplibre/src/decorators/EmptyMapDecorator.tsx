import { type ReactElement, useMemo } from 'react';
import MapLibreMap from '../components/MapLibreMap/MapLibreMap';
import { MapComponentsProvider } from '../index';
import './style.css';
import { ThemeProvider as MUIThemeProvider } from '@mui/material/styles';
import type { Decorator, StoryContext } from '@storybook/react-vite';
import MlNavigationTools from '../components/MlNavigationTools/MlNavigationTools';
import getTheme from '../ui_components/MapcomponentsTheme';

const decorators: Decorator[] = [
	(Story, context: StoryContext): ReactElement => {
		const theme = useMemo(
			() => getTheme(context.globals?.theme as 'dark' | 'light' | undefined),
			[context.globals?.theme]
		);

		return (
			<div className="fullscreen_map">
				<MapComponentsProvider>
					<MUIThemeProvider theme={theme}>
						<Story />
						<MapLibreMap
							mapId="map_1"
							options={{
								zoom: 12.5,
								center: [7.0851268, 50.73884],
							}}
						/>
						<MlNavigationTools showZoomButtons={false} mapId="map_1" />
					</MUIThemeProvider>
				</MapComponentsProvider>
			</div>
		);
	},
];

export default decorators;
