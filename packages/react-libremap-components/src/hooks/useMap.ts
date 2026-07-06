import { useContext, useEffect, useRef, useState } from 'react';
import { v4 as uuidv4 } from 'uuid';
import type IMapLibreGlWrapper from '../components/MapLibreMap/lib/MapLibreGlWrapper';
import type { LayerState } from '../components/MapLibreMap/lib/MapLibreGlWrapper';
import MapContext, { type MapContextType } from '../contexts/MapContext';
import useMapState from './useMapState';

type useMapType = {
	map: IMapLibreGlWrapper | undefined;
	mapIsReady: boolean;
	componentId: string;
	layers: (LayerState | undefined)[];
	cleanup: () => void;
};

function useMap(props?: { mapId?: string; waitForLayer?: string }): useMapType {
	const mapContext: MapContextType = useContext(MapContext);
	const [state, setState] = useState<{ map: IMapLibreGlWrapper | undefined; ready: boolean }>({
		map: undefined,
		ready: false,
	});

	const mapState = useMapState({
		mapId: props?.mapId,
		watch: {
			viewport: false,
			layers: !!props?.waitForLayer,
			sources: false,
		},
		filter: {
			includeBaseLayers: true,
		},
	});

	const mapRef = useRef<IMapLibreGlWrapper | null>(null);

	const componentId = useRef(uuidv4());

	const cleanup = () => {
		if (mapRef.current) {
			mapRef.current.cleanup(componentId.current);
		}
	};

	useEffect(() => {
		return () => {
			if (mapRef.current) {
				mapRef.current.cleanup(componentId.current);
			}
			mapRef.current = null;
		};
	}, []);

	useEffect(() => {
		if (mapRef.current && mapRef.current.cancelled === true) {
			mapRef.current = null;
			setState({ map: undefined, ready: false });
		}
		if (mapRef.current || !mapContext.mapExists(props?.mapId)) return;

		// check if waitForLayer (string, layer id of the layer this hook is supposed to wait for)
		// exists as layer in the MapLibre instance
		if (props?.waitForLayer) {
			let layerFound = false;

			mapState?.layers?.forEach((layer: any) => {
				if (layer.id === props?.waitForLayer) {
					layerFound = true;
				}
			});
			if (!layerFound) {
				return;
			}
		}
		mapRef.current = mapContext.getMap(props?.mapId);
		setState({ map: mapRef.current, ready: true });
	}, [mapContext.mapIds, mapState.layers, mapContext, props]);

	return {
		map: state.map,
		mapIsReady: state.ready,
		componentId: componentId.current,
		layers: mapState.layers,
		cleanup,
	};
}

export default useMap;

export type { useMapType };
