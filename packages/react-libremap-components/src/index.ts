export { default as IMapLibreGlWrapper } from './components/MapLibreMap/lib/MapLibreGlWrapper';
export { default as MapLibreMap } from './components/MapLibreMap/MapLibreMap';

//export { default as MlClientSearch } from './components/MlClientSearch/MlClientSearch';

export { default as MlFeatureDraw } from './components/MlFeatureDraw/MlFeatureDraw';

export { default as MlGeoJsonLayer } from './components/MlGeoJsonLayer/MlGeoJsonLayer';
export { default as MlImageMarkerLayer } from './components/MlImageMarkerLayer/MlImageMarkerLayer';
export { default as MlLayer } from './components/MlLayer/MlLayer';

export { default as MlMarker } from './components/MlMarker/MlMarker';
export { default as MlNavigationControls } from './components/MlNavigationControls/MlNavigationControls';

export { default as MlOrderLayers } from './components/MlOrderLayers/MlOrderLayers';
export { default as MlScaleReference } from './components/MlScaleReference/MlScaleReference';
export { default as MlTerrainLayer } from './components/MlTerrainLayer/MlTerrainLayer';
export { default as MlTextLayer } from './components/MlTextLayer/MlTextLayer';
export type {
	MlTextLayerProps,
	TextAnnotation,
} from './components/MlTextLayer/MlTextLayer';
export { default as MlVehicleLayer } from './components/MlVehicleLayer/MlVehicleLayer';
export type {
	MlVehicleLayerProps,
	VehicleData,
} from './components/MlVehicleLayer/MlVehicleLayer';
export { default as MlWmsFeatureInfoPopup } from './components/MlWmsFeatureInfoPopup/MlWmsFeatureInfoPopup';
export { default as MlWmsLayer } from './components/MlWmsLayer/MlWmsLayer';
export { default as LayerContext, LayerContextProvider } from './contexts/LayerContext';
// Context
export { MapComponentsProvider, default as MapContext } from './contexts/MapContext';
export {
	MapContextMenuContext,
	MapContextMenuProvider,
	useMapContextMenuContext,
} from './contexts/MapContextMenuContext';
export type {
	ContextMenuRegistration,
	MapContextMenuContextType,
	MapContextMenuProviderProps,
} from './contexts/MapContextMenuContext';
export { default as SimpleDataContext } from './contexts/SimpleDataContext';
export { default as SimpleDataProvider } from './contexts/SimpleDataProvider';
export { default as useAddImage } from './hooks/useAddImage/useAddImage';
export { default as useAddProtocol } from './hooks/useAddProtocol/useAddProtocol';
export { default as useExportMap } from './hooks/useExportMap';
export { default as useFeatureDraw } from './hooks/useFeatureDraw/useFeatureDraw';
export { default as useGpx } from './hooks/useGpx/useGpx';
export { default as useLayer } from './hooks/useLayer';
export { default as useLayerContext } from './hooks/useLayerContext';
export { default as useLayerEvent } from './hooks/useLayerEvent';
export { default as useLayerFilter } from './hooks/useLayerFilter/useLayerFilter';
export { default as useLayerHoverPopup } from './hooks/useLayerHoverPopup/LayerHoverPopup';
export { default as useMap } from './hooks/useMap';
export { default as useMapContextMenu } from './hooks/useMapContextMenu/useMapContextMenu';
export type {
	MapContextMenuClickContext,
	MapContextMenuItem,
	UseMapContextMenuOptions,
	UseMapContextMenuResult,
} from './hooks/useMapContextMenu/useMapContextMenu';
export { default as useMapState } from './hooks/useMapState';
export { default as useSource } from './hooks/useSource';
export { default as useWms } from './hooks/useWms';
// Styles
export { default as GruvboxStyle } from './omt_styles/gruvbox';
export { default as MedievalKingdomStyle } from './omt_styles/medieval_kingdom';
export { default as MonokaiStyle } from './omt_styles/monokai';
export { default as OceanicNextStyle } from './omt_styles/oceanic_next';
export { default as SolarizedStyle } from './omt_styles/solarized';
export { convertCsv, CSVProtocolHandler } from './protocol_handlers/csv';
export { convertOSM, OSMProtocolHandler } from './protocol_handlers/osm';
export { convertTopojson, TopojsonProtocolHandler } from './protocol_handlers/topojson';
export { convertXML, XMLProtocolHandler } from './protocol_handlers/xml';

// Redux
import {
	default as MapStore_store,
	removeLayerFromMapConfig,
	removeMapConfig,
	setLayerInMapConfig,
	setMapConfig,
	setMasterVisible,
	updateLayerOrder,
} from './stores/map.store';

const MapStore = {
	store: MapStore_store,
	setMapConfig,
	removeMapConfig,
	setLayerInMapConfig,
	removeLayerFromMapConfig,
	updateLayerOrder,
	setMasterVisible,
};

export { MapStore };
