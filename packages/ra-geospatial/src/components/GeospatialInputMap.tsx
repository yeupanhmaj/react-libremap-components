import {
	MapLibreMap,
	MlFeatureEditor,
	MlGeoJsonLayer,
	useMap,
} from '@mapcomponents/react-maplibre';
import type { Feature } from '@turf/helpers';
import { centroid, type feature } from '@turf/turf';
import type { Geometry } from 'geojson';
import type { LngLatLike } from 'maplibre-gl';
import type React from 'react';
import { useEffect, useState } from 'react';
import { type InputProps, useInput, useRecordContext } from 'react-admin';
import { parse as wellknownParse, stringify as wellknownStringify } from 'wellknown';

export interface GeospatialInputMapProps extends InputProps<any> {
	MapLibreMapProps?: React.ComponentProps<typeof MapLibreMap>;
	geometrytype?: 'point' | 'line' | 'polygon';
	embeddedMap?: boolean;
	mapId?: string;
}

function GeospatialInputMap(props: GeospatialInputMapProps) {
	const record = useRecordContext();
	const mapHook = useMap({ mapId: props?.mapId });

	const [geojson, setGeojson] = useState<typeof feature>();
	const [oldGeoJson, setOldGeoJson] = useState<typeof feature>();
	const input = useInput(props);

	const {
		field: { onChange },
	} = input;

	useEffect(() => {
		if (typeof record === 'undefined' || !record[props?.source]) return;

		const _geoJson = {
			type: 'Feature',
			properties: {},
			geometry: wellknownParse(record[props?.source]),
		};

		// eslint-disable-next-line react-hooks/set-state-in-effect
		setGeojson(_geoJson as unknown as typeof feature);
		setOldGeoJson(_geoJson as unknown as typeof feature);
	}, [record, props.source]);

	useEffect(() => {
		if (!mapHook.map) return;

		if (record?.[props?.source]) {
			const _center = centroid(wellknownParse(record[props?.source]) as typeof Feature);

			if (_center?.geometry?.coordinates) {
				mapHook.map.setCenter(_center.geometry.coordinates as LngLatLike);
			}
		}
		// eslint-disable-next-line react-hooks/exhaustive-deps
	}, [mapHook.map, props.source]);

	return (
		<>
			{props.embeddedMap && (
				<MapLibreMap
					{...props?.MapLibreMapProps}
					options={{
						zoom: 14,
						style: 'https://wms.wheregroup.com/tileserver/style/klokantech-basic.json',
						center:
							Array.isArray(props?.MapLibreMapProps?.options?.center) &&
							props.MapLibreMapProps.options.center.length === 2
								? [
										props.MapLibreMapProps.options.center[0],
										props.MapLibreMapProps.options.center[1],
									]
								: [0, 0],
						...props?.MapLibreMapProps?.options,
					}}
					style={{
						width: '100%',
						height: '400px',
						...props?.MapLibreMapProps?.style,
					}}
				/>
			)}

			{props.type === 'point' && (
				<>
					{oldGeoJson && (
						<MlGeoJsonLayer
							mapId={props?.mapId}
							geojson={oldGeoJson as typeof feature}
							options={{
								paint: {
									'circle-radius': 8,
									'circle-color': '#6f6f96',
									'circle-stroke-color': 'white',
									'circle-stroke-width': 3,
									'circle-opacity': 0.8,
								},
							}}
							type="circle"
							insertBeforeLayer="gl-draw-polygon-fill-inactive.cold"
						/>
					)}

					<MlFeatureEditor
						mapId={props?.mapId}
						geojson={geojson as typeof feature}
						mode={geojson ? 'simple_select' : 'draw_point'}
						onChange={(_geojson) => {
							if (typeof _geojson[0] !== 'undefined') {
								onChange(wellknownStringify(_geojson[0] as unknown as Geometry));
							}
						}}
					/>
				</>
			)}
			{props.type === 'polygon' && (
				<>
					{oldGeoJson && (
						<MlGeoJsonLayer
							mapId={props?.mapId}
							geojson={oldGeoJson as typeof feature}
							options={{
								paint: {
									'fill-color': '#6f6f96',
									'fill-opacity': 0.6,
								},
							}}
							type="fill"
							insertBeforeLayer="gl-draw-polygon-fill-inactive.cold"
						/>
					)}

					<MlFeatureEditor
						mapId={props?.mapId}
						geojson={geojson as typeof feature}
						mode={geojson ? 'simple_select' : 'draw_polygon'}
						onChange={(_geojson) => {
							if (typeof _geojson[0] !== 'undefined') {
								onChange(wellknownStringify(_geojson[0] as unknown as Geometry));
							}
						}}
					/>
				</>
			)}
			{props.type === 'line' && (
				<>
					{oldGeoJson && (
						<MlGeoJsonLayer
							mapId={props?.mapId}
							geojson={oldGeoJson as typeof feature}
							options={{
								paint: {
									'line-width': 6,
									'line-color': '#6f6f96',
									'line-opacity': 0.6,
								},
							}}
							type="line"
							insertBeforeLayer="gl-draw-polygon-fill-inactive.cold"
						/>
					)}

					<MlFeatureEditor
						mapId={props?.mapId}
						geojson={geojson as typeof feature}
						mode={geojson ? 'simple_select' : 'draw_line_string'}
						onChange={(_geojson) => {
							if (typeof _geojson[0] !== 'undefined') {
								onChange(wellknownStringify(_geojson[0] as unknown as Geometry));
							}
						}}
					/>
				</>
			)}
		</>
	);
}

GeospatialInputMap.defaultProps = {
	type: 'point',
	embeddedMap: true,
};

export default GeospatialInputMap;
