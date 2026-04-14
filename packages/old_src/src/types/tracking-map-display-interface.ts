import type * as L from 'leaflet';
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

export type markerState = {
	marker: L.Marker;
	lat: number;
	lng: number;
	heading: number;

	index: number;
	progress: number;
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

export type PointTrackList = {
	id: string;
	positions: EagPointTrackingMapFeature[];
	currentIndex: number;
	heading: number;

	easeOutNumber: number;
};
