import { MapComponentsProvider, MapLibreMap } from 'react-libremap-components';
import './style.css';
import { DeckGlContextProvider } from '../contexts/DeckGlContext';

const decorators = [
	(Story: any, context: any) => {
		return (
			<div className="fullscreen_map">
				<MapComponentsProvider>
					<DeckGlContextProvider mapId={context.mapId}>
						<Story />
					</DeckGlContextProvider>
					<MapLibreMap
						options={
							context?.parameters?.mapOptions
								? {
										style: 'https://wms.wheregroup.com/tileserver/style/osm-bright.json',
										...context.parameters.mapOptions,
									}
								: {
										zoom: 14.5,
										style: 'https://wms.wheregroup.com/tileserver/style/osm-bright.json',
										center: [7.0851268, 50.73884],
									}
						}
						mapId={context.mapId}
					/>
				</MapComponentsProvider>
			</div>
		);
	},
];

export default decorators;
