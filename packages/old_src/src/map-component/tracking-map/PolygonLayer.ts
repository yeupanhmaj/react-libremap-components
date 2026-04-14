import L from 'leaflet';
import type { EagPolygonTrackingMapFeature } from '../../types/tracking-map-display-interface';

export class PolygonLayer {
	//#region
	private map: L.Map;
	private activePolygons: L.Polygon[] = [];
	private zones: EagPolygonTrackingMapFeature[] = [];

	private zoneRenderer!: L.Renderer;

	private defaultZoneStyle = {
		borderColor: '#000000',
		weight: 2,
		fillColor: '#00FF00',
		fillOpacity: 0.4,
		opacity: 1,
		dashArray: undefined,
	};
	//#endregion

	constructor(map: L.Map) {
		this.map = map;
	}

	//#region ================ PUBLIC =================
	updateZones(zones: EagPolygonTrackingMapFeature[]) {
		this.zones = zones;
		this._renderAutoZones();
		this.zoneRenderer = L.canvas({ padding: 0.5 });
	}

	hideZones() {
		this.activePolygons.forEach((p) => this.map.removeLayer(p));
		this.activePolygons = [];
	}
	//#endregion ================= PUBLIC =================

	//#region ================= PRIVATE =================
	private _renderAutoZones() {
		this.hideZones();

		this.zones.forEach((zone) => {
			if (zone.properties?.autoShow) this._drawZone(zone, false);
		});
	}

	private _drawZone(zone: EagPolygonTrackingMapFeature, fitBounds: boolean) {
		const props = zone.properties;
		const latLngRings = this._convertPolygonLatLngs(zone);

		const polygon = L.polygon(latLngRings, {
			renderer: this.zoneRenderer,
			interactive: true,

			color: props?.borderColor ?? this.defaultZoneStyle.borderColor,
			weight: props?.weight ?? this.defaultZoneStyle.weight,
			opacity: props?.opacity ?? this.defaultZoneStyle.opacity,
			fillColor: props?.fillColor ?? this.defaultZoneStyle.fillColor,
			fillOpacity: props?.fillOpacity ?? this.defaultZoneStyle.fillOpacity,
			dashArray: props?.dashArray ?? this.defaultZoneStyle.dashArray,
		}).addTo(this.map);

		if (props?.name) polygon.bindTooltip(props.name);

		this.activePolygons.push(polygon);

		if (fitBounds) this.map.fitBounds(polygon.getBounds(), { padding: [40, 40] });
	}

	private _isMultiPolygonCoords(coords: unknown): boolean {
		return this._isNestedArray(coords, 4);
	}

	private _isNestedArray(value: unknown, depth: number): boolean {
		let current = value;

		for (let i = 0; i < depth; i++) {
			if (!Array.isArray(current)) return false;
			current = current[0];
		}

		return true;
	}

	private _convertPolygonLatLngs(zone: EagPolygonTrackingMapFeature) {
		const coords = zone.geometry.coordinates;

		const toLatLng = (lngLat: number[]): [number, number] => [lngLat[1], lngLat[0]];

		if (this._isMultiPolygonCoords(coords)) {
			return (coords as unknown as number[][][][]).map((polygon) =>
				polygon.map((ring) => ring.map(toLatLng))
			);
		}

		return (coords as number[][][]).map((ring) => ring.map(toLatLng));
	}

	//#endregion ================= PRIVATE =================
}
