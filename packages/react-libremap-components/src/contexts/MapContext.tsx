import React, { type ReactNode, useRef, useState } from 'react';
import type IMapLibreGlWrapper from '../components/MapLibreMap/lib/MapLibreGlWrapper';

import { LayerContextProvider } from './LayerContext';

export interface MapContextType {
	mapIds: string[];
	mapExists: (map_id: string | undefined) => boolean;
	maps: { [key: string]: IMapLibreGlWrapper };
	map: IMapLibreGlWrapper | undefined;
	getMap: (map_id: string | undefined) => IMapLibreGlWrapper;
	setMap: (map: IMapLibreGlWrapper) => void;
	removeMap: (map_id: string | undefined) => void;
	registerMap: (map_id: string | undefined, map: IMapLibreGlWrapper) => void;
}
const missingProvider = (method: string) => () => {
	throw new Error(
		`MapContext.${method}() was called outside of <MapComponentsProvider>. ` +
			`Wrap your component tree with <MapComponentsProvider> and make sure ` +
			`<MapLibreMap> is rendered inside it.`
	);
};

const MapContext = React.createContext<MapContextType>({
	mapIds: [],
	maps: {},
	map: undefined,
	mapExists: () => false,
	getMap: missingProvider('getMap'),
	setMap: missingProvider('setMap'),
	removeMap: missingProvider('removeMap'),
	registerMap: missingProvider('registerMap'),
});

/**
 * MapComponentsProvider must be imported and wrapped around component where at least one of its child nodes requires access to a MapLibre-gl or openlayers instance that is registered in this mapContext.
MapComponentsProvider must be used one level higher than the first use of MapContext.
 *
 * MapComponentsProvider requires at least one use of the MapLibreMap component somewhere down the component tree that will create the MapLibre-gl object and set the reference at MapContext.map. For MapLibre maps it is a good idea to provide a mapId attribute to the MapLibreMap Component even if you are only using a single map instance at start. It will make a later transition to using multiple instances within the same project much easier.
 */

const MapComponentsProvider = ({ children }: { children: ReactNode }) => {
	const [map, setMap] = useState<IMapLibreGlWrapper | undefined>(undefined);
	const [mapIds, setMapIds] = useState<[...string[]]>([]);
	const mapIds_raw = useRef<[...string[]]>([]);
	const maps = useRef<{ [key: string]: IMapLibreGlWrapper }>({});

	const removeMap = (mapId: string) => {
		if (mapId) {
			if (typeof maps.current[mapId] !== 'undefined') {
				delete maps.current[mapId];
			}
			const mapIdIndex = mapIds_raw.current.indexOf(mapId);
			if (mapIdIndex > -1) {
				mapIds_raw.current.splice(mapIdIndex, 1);
			}
			setMapIds([...mapIds_raw.current]);

			if (mapIds_raw.current.length === 0 && map) {
				setMap(undefined);
			}
		} else {
			removeMap('anonymous_map');
		}
	};

	const setMapHandler = (mapInstance: IMapLibreGlWrapper) => {
		setMap(mapInstance);

		if (mapIds.length === 0) {
			const mapId = 'anonymous_map';
			setMapIds([...mapIds, mapId]);
			maps.current[mapId] = mapInstance;
		}
	};

	const value = {
		map: map,
		setMap: setMapHandler,
		maps: maps.current,
		mapIds: mapIds,
		registerMap: (mapId: string, mapInstance: IMapLibreGlWrapper) => {
			if (mapId && mapInstance) {
				maps.current[mapId] = mapInstance;
				mapIds_raw.current.push(mapId);
				setMapIds([...mapIds_raw.current]);

				if (!map || map?.cancelled === true) {
					setMap(mapInstance);
				}
			}
		},
		removeMap,
		mapExists: (mapId: string | undefined) => {
			if (mapId && Object.keys(maps.current).indexOf(mapId) === -1) {
				return false;
			} else if (!mapId && !map) {
				return false;
			}
			return true;
		},
		getMap: (mapId: string): IMapLibreGlWrapper | null => {
			if (mapId && mapIds.indexOf(mapId) !== -1) {
				return maps.current[mapId];
			} else if (!mapId && map) {
				return map;
			}

			return null;
		},
	} as unknown as MapContextType;

	return (
		<MapContext.Provider value={value}>
			<LayerContextProvider>{children}</LayerContextProvider>
		</MapContext.Provider>
	);
};

export { MapComponentsProvider };
export default MapContext;
