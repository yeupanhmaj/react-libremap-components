import * as React from 'react';
import * as L from 'leaflet';

export type EagMapDisplayProps = {
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

//#region ================ TRACKING MAP TYPES =================
export type EagRouteTrackingMapFeature = GeoJSON.Feature<GeoJSON.LineString, EagRouteProperties>;

export type EagPointTrackingMapFeature = GeoJSON.Feature<
	GeoJSON.Point,
	GeoJSON.GeoJsonProperties & EagPointProperties
>;

export type EagPolygonTrackingMapFeature = GeoJSON.Feature<
	GeoJSON.Polygon | GeoJSON.MultiPolygon,
	EagPolygonTrackingMapProperties
>;

export type ZoneStyle = {
	fillColor?: string;
	borderColor?: string;
	fillOpacity?: number;
	opacity?: number;
	weight?: number;
	dashArray?: string;
};

export type EagPolygonTrackingMapProperties = GeoJSON.GeoJsonProperties & {
	refId: string;
	name?: string;
	autoShow?: boolean;
} & ZoneStyle;

export type UpdateZoneByPointsParams = {
	points: [number, number][];
	refId: string;
	name?: string;
	autoShow?: boolean;
	style?: ZoneStyle;
	fitBounds?: boolean;
};

export interface EagRouteProperties {
	id: string;
	refId?: string;
	color?: string;
	weight?: number;
	opacity?: number;
	dashArray?: string;
	zIndex?: number;

	fitBounds?: boolean;
	autoShow?: boolean;
}

export type EagPointProperties = {
	id: string;
	heading: number;

	title?: string;
	isClickShowRoute?: boolean;
	iconKey?: string;
};

export interface EagIconCache {
	[key: string]: HTMLImageElement;
}

export interface EagTrackingMapProps {
	apiKey: string;
	tileOptions?: L.TileLayerOptions;
	center?: [number, number];

	pointFeatures?: EagPointTrackingMapFeature[];
	routeFeatures?: EagRouteTrackingMapFeature[];
	polygonFeatures?: EagPolygonTrackingMapFeature[];
	defaultIconUrl?: string;
	iconCache?: EagTrackingMapIconConfig[];

	urlTemplate?: string;
}

export interface EagTrackingMapIconConfig {
	name: string;
	src: string;
}
//#endregion =================

declare const EagMapDisplay: React.FC<EagMapDisplayProps>;

declare const EagTrackingMapDisplay: React.FC<EagTrackingMapProps>;

export { EagMapDisplay, EagTrackingMapDisplay };
