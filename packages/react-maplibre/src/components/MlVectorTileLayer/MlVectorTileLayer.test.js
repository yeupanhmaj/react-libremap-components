import React from 'react';
import { uuid_regex } from '../../setupTests';
import { layerRemovalTest, sourceRemovalTest } from '../../util';
import MlVectorTileLayer from './MlVectorTileLayer';

const testComponent = (
	<MlVectorTileLayer
		{...{
			url: 'https://wms.wheregroup.com/tileserver/tile/tileserver.php?/europe-0-14/index.json?/europe-0-14/{z}/{x}/{y}.pbf',
			layers: [
				{
					id: 'landuseLine',
					'source-layer': 'landuse',
					layout: {
						'line-cap': 'round',
						'line-join': 'round',
					},
					paint: { 'line-width': 1, 'line-color': '#ff0000' },
				},
			],
			sourceOptions: {
				minzoom: 0,
				maxzoom: 20,
			},
		}}
	/>
);

layerRemovalTest('<MlVectorTileLayer />', testComponent, /^.*"landuseLine".*$/, 'landuseLine');
sourceRemovalTest(
	'<MlVectorTileLayer />',
	testComponent,
	new RegExp('^.*"MlVectorTileLayer-' + uuid_regex + '".*$'),
	'MlVectorTileLayer-{uuid}'
);
