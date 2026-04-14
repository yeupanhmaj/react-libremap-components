import LeafletMapView from './map-component/leaflet-map/leaflet-map';
import TrackingMapDisplay from './map-component/tracking-map/TrackingMapDisplay';
import type { LeafletMapViewProps } from './types/interface';

export * from './types/tracking-map-display-interface';

export const EagMapDisplay = LeafletMapView;
export type EagMapDisplayProps = LeafletMapViewProps;

export const EagTrackingMapDisplay = TrackingMapDisplay;
