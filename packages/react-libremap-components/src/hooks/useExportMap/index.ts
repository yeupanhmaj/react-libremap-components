import { useMemo } from 'react';
import type IMapLibreGlWrapper from '../../components/MapLibreMap/lib/MapLibreGlWrapper';
import useMap from '../useMap';
import { createExport, type createExportOptions } from './lib';

interface exportMapProps {
	/**
	 * Id of the target MapLibre instance in mapContext
	 */
	mapId?: string;
}

export default function useExportMap(props: exportMapProps) {
	const mapHook = useMap({ mapId: props.mapId });

	const _createExport = useMemo(() => {
		if (mapHook.map) {
			return (
				options: Omit<createExportOptions, 'map'> & Partial<Pick<createExportOptions, 'map'>>
			) => {
				return createExport({ map: mapHook.map as IMapLibreGlWrapper, ...options });
			};
		}
		return;
	}, [mapHook.map]);

	return {
		createExport: _createExport,
	};
}
