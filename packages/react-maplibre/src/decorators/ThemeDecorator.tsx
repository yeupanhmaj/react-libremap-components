import type React from 'react';
import { useMemo } from 'react';

import { MapComponentsProvider } from '../index';
import './style.css';
import { ThemeProvider as MUIThemeProvider } from '@mui/material/styles';
import type { StoryContext } from '@storybook/react-vite';
import getTheme from '../ui_components/MapcomponentsTheme';

const decorators = [
	(Story: React.FC, context?: StoryContext): React.ReactElement => {
		const theme = useMemo(() => getTheme(context?.globals?.theme), [context?.globals?.theme]);

		return (
			<div className="fullscreen_map">
				<MapComponentsProvider>
					<MUIThemeProvider theme={theme}>
						<Story />
					</MUIThemeProvider>
				</MapComponentsProvider>
			</div>
		);
	},
];

export default decorators;
