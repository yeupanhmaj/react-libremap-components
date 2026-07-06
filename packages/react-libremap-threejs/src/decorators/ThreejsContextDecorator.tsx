import {
	MapComponentsProvider,
	MapLibreMap,
} from 'react-libremap-components';
import React from 'react';
import { ThreeProvider } from '../contexts/ThreeProvider';
import './style.css';

const decorators = [
	(Story: any, context: any) => {
		return (
			<div className="fullscreen_map">
				<MapComponentsProvider>
					<ThreeProvider mapId="map_1" id="three-scene-layer" beforeId="water_name_line">
						<Story />
					</ThreeProvider>
					<MapLibreMap
						options={{
							zoom: 14.5,
							style: 'https://wms.wheregroup.com/tileserver/style/osm-liberty.json',
							center: [7.099771581806502, 50.73395746209983],
						}}
						mapId="map_1"
					/>
				</MapComponentsProvider>
			</div>
		);
	},
];

export default decorators;
