import type * as L from 'leaflet';
import type { GeomanColorOptionsType } from '../map-component/leaflet-map/GeomanColorOptions';

export type LeafletMapViewProps = {
	/**
	 * Required API key for the tile layer service.
	 */
	apiKey: string;
	/**
	 * Options to configure the base tile layer.
	 */
	tileOptions?: L.TileLayerOptions;
	showDrawControls?: boolean;
	color?: GeomanColorOptionsType;
	/**
	 * Center as [lat, lng] - optional, no center marker will be shown if not provided
	 */
	center?: [number, number];
	/**
	 * Emits [lat, lng] when the center changes from user interaction.
	 */
	onCenterChanged?: (center: [number, number]) => void;
	zoom: number;
	onZoomChanged?: (zoom: number) => void;
	geoJson?: GeoJSON.Feature[];
	// eslint-disable-next-line @typescript-eslint/no-explicit-any
	onGeoJsonChange?: (feature: any) => void;
	isShowCenterMarker?: boolean;
	/**
	 * Animate flyTo on center prop changes (default: true)
	 */
	flyToOnCenterChange?: boolean;
	/**
	 * Options for pan/zoom animation when center changes
	 */
	flyOptions?: L.ZoomPanOptions;
	/**
	 * Clear localStorage on component mount (useful for forms)
	 */
	clearStorageOnMount?: boolean;
	/**
	 * Custom storage key to isolate different map instances
	 */
	storageKey?: string;
};
