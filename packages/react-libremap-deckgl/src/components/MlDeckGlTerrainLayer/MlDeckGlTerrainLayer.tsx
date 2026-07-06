import { TerrainLayer, type TerrainLayerProps } from '@deck.gl/geo-layers';
import { useMap } from 'react-libremap-components';
import { useEffect, useMemo } from 'react';
import useDeckGl from '../../hooks/useDeckGl';

export interface MlDeckGlTerrainLayerProps {
	/**
	 * Id of the target MapLibre instance in mapContext
	 */
	mapId?: string;
	/**
	 * URL template for terrain elevation tiles (terrain-rgb encoded).
	 * Must include {z}, {x}, {y} placeholders.
	 * Example: 'https://s3.amazonaws.com/elevation-tiles-prod/terrarium/{z}/{x}/{y}.png'
	 */
	elevationData: string;
	/**
	 * URL template for the surface texture tiles.
	 * Must include {z}, {x}, {y} placeholders.
	 * Leave undefined to render without a texture.
	 */
	texture?: string;
	/**
	 * Decoder parameters for the elevation tiles.
	 * Defaults to Mapbox terrain-rgb encoding.
	 */
	elevationDecoder?: TerrainLayerProps['elevationDecoder'];
	/**
	 * Minimum zoom level at which the layer is visible.
	 * @default 0
	 */
	minZoom?: number;
	/**
	 * Maximum zoom level at which the layer is visible.
	 * @default 23
	 */
	maxZoom?: number;
	/**
	 * Render terrain as wireframe instead of solid mesh.
	 * @default false
	 */
	wireframe?: boolean;
}

const DEFAULT_ELEVATION_DECODER: TerrainLayerProps['elevationDecoder'] = {
	rScaler: 6553.6,
	gScaler: 25.6,
	bScaler: 0.1,
	offset: -10000,
};

const MlDeckGlTerrainLayer = (props: MlDeckGlTerrainLayerProps) => {
	const mapHook = useMap({ mapId: props.mapId });
	const deckGlHook = useDeckGl();

	const terrainLayer = useMemo(() => {
		if (!props.elevationData) return null;
		return new TerrainLayer({
			id: 'ml-deckgl-terrain-layer',
			minZoom: props.minZoom ?? 0,
			maxZoom: props.maxZoom ?? 23,
			strategy: 'no-overlap',
			elevationDecoder: props.elevationDecoder ?? DEFAULT_ELEVATION_DECODER,
			elevationData: props.elevationData,
			texture: props.texture,
			wireframe: props.wireframe ?? false,
			color: [255, 255, 255],
		});
	}, [
		props.elevationData,
		props.texture,
		props.elevationDecoder,
		props.minZoom,
		props.maxZoom,
		props.wireframe,
	]);

	useEffect(() => {
		if (!mapHook.map || !terrainLayer) return;

		deckGlHook.addLayer(terrainLayer);

		return () => {
			deckGlHook.removeLayer(terrainLayer);
		};
	}, [mapHook.map, terrainLayer]);

	return null;
};

export default MlDeckGlTerrainLayer;
