import { type FC, type ReactElement, useMemo } from 'react';
import MapLibreMap from '../components/MapLibreMap/MapLibreMap';
import { MapComponentsProvider } from '../index';
import './style.css';
import { ThemeProvider as MUIThemeProvider } from '@mui/material/styles';
import type { Decorator } from '@storybook/react-vite';
import getTheme from '../ui_components/MapcomponentsTheme';

interface StoryContext {
	globals: {
		theme?: 'dark' | 'light';
	};
}

const decorators: Decorator[] = [
	(Story: FC, context?: StoryContext): ReactElement => {
		const theme = useMemo(() => getTheme(context?.globals?.theme), [context?.globals?.theme]);

		return (
			<div className="fullscreen_map">
				<MapComponentsProvider>
					<MUIThemeProvider theme={theme}>
						<Story />
						<MapLibreMap
							options={{
								zoom: 14.5,
								style: 'https://wms.wheregroup.com/tileserver/style/osm-bright.json',
								center: [7.0851268, 50.73884],
							}}
							mapId="map_1"
						/>
					</MUIThemeProvider>
				</MapComponentsProvider>
			</div>
		);
	},
];

export default decorators;
