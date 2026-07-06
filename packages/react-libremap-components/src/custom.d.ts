import type { GeoJSONObject } from '@turf/turf';
import type { GeoJSONFeature } from 'maplibre-gl';

export type GeoJSON = GeoJSONFeature & GeoJSONObject;

