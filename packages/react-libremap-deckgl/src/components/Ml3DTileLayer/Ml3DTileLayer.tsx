import { Tile3DLayer, type Tile3DLayerProps } from '@deck.gl/geo-layers';
import { useMap } from 'react-libremap-components';
import { useEffect, useMemo } from 'react';
import useDeckGl from '../../hooks/useDeckGl';

export interface Ml3DTileLayerProps extends Tile3DLayerProps {
	/**
	 * Id of the target MapLibre instance in mapContext
	 */
	mapId?: string;
	/**
	 * Id of an existing layer in the mapLibre instance to help specify the layer order
	 * This layer will be visually beneath the layer with the "beforeId" id.
	 */
	beforeId?: string;
}

const Ml3DTileLayer = (props: Ml3DTileLayerProps) => {
	const { mapId, ...Ml3DTileProps } = props;
	const mapHook = useMap({ mapId: mapId });
	const deckGlHook = useDeckGl();

	const tile3dLayer = useMemo(() => {
		if (!Ml3DTileProps.data) return null;
		else
			return new Tile3DLayer({
				...Ml3DTileProps,
			});
	}, [Ml3DTileProps]);

	useEffect(() => {
		if (!mapHook.map || !tile3dLayer) return;

		deckGlHook.addLayer(tile3dLayer);

		return () => {
			// eslint-disable-next-line @typescript-eslint/no-unused-expressions
			tile3dLayer && deckGlHook.removeLayer(tile3dLayer);
		};
	}, [mapHook.map, tile3dLayer]);

	return null;
};

export default Ml3DTileLayer;
