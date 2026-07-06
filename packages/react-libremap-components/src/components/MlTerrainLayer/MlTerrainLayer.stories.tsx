import { useEffect, useState } from 'react';
import MapContextDecorator from '../../decorators/MapContextDecorator';
import useMap from '../../hooks/useMap';
import MlTerrainLayer from './MlTerrainLayer';

const storyoptions = {
	title: 'MapComponents/MlTerrainLayer',
	component: MlTerrainLayer,
	argTypes: {},
	decorators: MapContextDecorator,
};
export default storyoptions;

const Template: any = () => {
	const [active, setActive] = useState<boolean>(true);

	const mapHook = useMap({ mapId: 'map_1' });
	useEffect(() => {
		if (!mapHook.map) return;
		mapHook.map.map.setCenter([11.200688, 47.427417]);
		mapHook.map.map.setZoom(12);
		mapHook.map.map.setPitch(60);
	}, [mapHook.map]);

	return (
		<>
			<button
				type="button"
				className="terrainLayerButton"
				onClick={() => setActive(!active)}
				style={{
					padding: '6px 16px',
					backgroundColor: active ? '#1976d2' : 'transparent',
					color: active ? '#fff' : '#1976d2',
					border: '1px solid #1976d2',
					borderRadius: '4px',
					cursor: 'pointer',
					fontFamily: 'inherit',
					fontSize: '0.875rem',
					fontWeight: 500,
				}}
			>
				Terrain Layer
			</button>
			{active && (
				<MlTerrainLayer
					sourceOptions={{
						tiles: ['https://s3.amazonaws.com/elevation-tiles-prod/terrarium/{z}/{x}/{y}.png'],
						// AWS elevation tiles use Terrarium encoding (not the default 'mapbox' encoding)
						encoding: 'terrarium' as const,
						tileSize: 256,
						maxzoom: 15,
					}}
				/>
			)}
		</>
	);
};

export const ExampleConfig = Template.bind({});
ExampleConfig.parameters = {};
ExampleConfig.args = {};
