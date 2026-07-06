import { Paper } from '@mui/material';
import type { Decorator } from '@storybook/react-vite';
import type { FC, ReactElement } from 'react';
import MapLibreMap, { type MapLibreMapProps } from '../components/MapLibreMap/MapLibreMap';
import MlScaleReference from '../components/MlScaleReference/MlScaleReference';
import { MapContextMenuProvider } from '../contexts/MapContextMenuContext';
import { MapComponentsProvider } from '../index';
import './style.css';

interface StoryContext {
	globals: {
		theme?: 'dark' | 'light';
	};
	name: string;
}

const makeMapContextDecorators = (options: MapLibreMapProps['options']): Decorator[] => {
	return [
		(Story: FC, context?: StoryContext): ReactElement => {
			return (
				<div className="fullscreen_map">
					<MapComponentsProvider>
						<MapContextMenuProvider mapId="map_1">
							{(context?.name === 'Example Config' || context?.name === 'Catalogue Demo') && (
								<Paper
									sx={{
										position: 'fixed',
										top: '70px',
										right: '20px',
										zIndex: 1300,
									}}
								>
									<MlScaleReference />
								</Paper>
							)}
							<Story />
							<MapLibreMap
								options={{
									zoom: 14.5,
									style: 'https://basemaps.cartocdn.com/gl/voyager-gl-style/style.json',
									center: [7.0851268, 50.73884],
									...(options ? { ...options } : {}),
								}}
								mapId="map_1"
							/>
						</MapContextMenuProvider>
					</MapComponentsProvider>
				</div>
			);
		},
	];
};

export default makeMapContextDecorators({});
export { makeMapContextDecorators };
