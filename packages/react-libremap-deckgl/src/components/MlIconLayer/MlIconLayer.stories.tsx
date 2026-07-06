import { MapContext, useMap } from 'react-libremap-components';
import { Box, Button, Checkbox, Divider, FormControlLabel, Paper, Typography } from '@mui/material';
import * as turf from '@turf/turf';
import * as d3 from 'd3';
import { useContext, useEffect, useRef, useState } from 'react';
import mapContextDecorator from '../../decorators/MapContextDecorator';
import MlIconLayer, { type VesselRecord } from './MlIconLayer';
import getShipType from './utils/getShipType';

const NAV_STATS: Record<number, string> = {
	0: 'Under way using engine',
	1: 'At anchor',
	2: 'Not under command',
	3: 'Restricted maneuverability',
	4: 'Constrained by her draught',
	5: 'Moored',
	6: 'Aground',
	7: 'Engaged in fishing',
	8: 'Under way sailing',
	15: 'Default',
};

const AIS_URL = 'https://meri.digitraffic.fi/api/ais/v1/locations';

const storyoptions = {
	title: 'MapComponents/MlIconLayer',
	component: MlIconLayer,
	argTypes: {
		showMovingVessels: { control: 'boolean' },
		showNotMovingVessels: { control: 'boolean' },
	},
	decorators: mapContextDecorator,
	parameters: {
		mapOptions: {
			zoom: 5.5,
			center: [22.87, 62.54],
			style: 'https://wms.wheregroup.com/tileserver/style/osm-bright.json',
		},
	},
};
export default storyoptions;

/** Parse a raw AIS GeoJSON feature into a VesselRecord with interpolation support */
function formatVessel(feature: any): VesselRecord | null {
	const props = feature.properties;
	const coords = feature.geometry?.coordinates;
	if (!coords || coords[0] == null || coords[1] == null) return null;

	const [lng, lat] = coords;
	const heading = props.heading ?? props.cog ?? 0;
	const sog = props.sog ?? 0;

	// Project the vessel forward by `sog * 5.14 m/s * 10 s` in the heading direction
	let destCoords: [number, number];
	try {
		destCoords = turf.transformTranslate(
			turf.point([lng, lat]),
			sog * 5.14444444, // metres over 10 s
			heading,
			{ units: 'meters' }
		).geometry.coordinates as [number, number];
	} catch {
		destCoords = [lng, lat];
	}

	return {
		mmsi: props.mmsi,
		velocity: sog,
		navStat: props.navStat,
		time_contact: props.timestampExternal ?? Date.now(),
		longitude: lng,
		latitude: lat,
		true_track: props.cog ?? 0,
		accurancy: props.posAcc ?? false,
		interpolatePos: d3.geoInterpolate([lng, lat], destCoords) as (t: number) => [number, number],
	};
}

const getCurrentTimeSeconds = () => Date.now();

const Template = () => {
	const mapContext = useContext(MapContext);
	const mapHook = useMap({ mapId: 'map_1' });

	const [vessels, setVessels] = useState<VesselRecord[]>([]);
	const [selectedVessel, setSelectedVessel] = useState<VesselRecord | null>(null);
	const [showMoving, setShowMoving] = useState(true);
	const [showStationary, setShowStationary] = useState(true);
	const [vesselInfo, setVesselInfo] = useState<Record<string, unknown> | null>(null);
	const timeParamRef = useRef<number | null>(null);
	const fetchTimerRef = useRef<ReturnType<typeof setTimeout> | null>(null);

	const fetchVessels = () => {
		const now = getCurrentTimeSeconds();
		const from = timeParamRef.current ?? now - 30000;
		timeParamRef.current = now;
		fetch(`${AIS_URL}?from=${from}`)
			.then((r) => (r.ok ? r.json() : Promise.reject(r.status)))
			.then((json) => {
				const records = (json.features ?? []).map(formatVessel).filter(Boolean) as VesselRecord[];
				setVessels(records);
				// schedule next fetch
				fetchTimerRef.current = setTimeout(fetchVessels, 10000);
			})
			.catch((err) => console.error('AIS fetch failed:', err));
	};

	// Jump map to Finland and start fetching
	useEffect(() => {
		if (!mapContext.map) return;
		mapContext.map.jumpTo({ center: [22.87, 62.54], zoom: 5.5 });
		fetchVessels();
		return () => {
			if (fetchTimerRef.current) clearTimeout(fetchTimerRef.current);
		};
	}, [mapContext.map]);

	// Fly to selected vessel
	useEffect(() => {
		if (!selectedVessel || !mapHook.map) return;
		const currentZoom = mapHook.map.map.getZoom();
		mapHook.map.map.flyTo({
			center: [selectedVessel.longitude, selectedVessel.latitude],
			zoom: currentZoom <= 9 ? 9 : currentZoom,
			speed: 1,
		});
		// Fetch detailed vessel info
		fetch(`https://meri.digitraffic.fi/api/ais/v1/vessels/${selectedVessel.mmsi}`)
			.then((r) => (r.ok ? r.json() : null))
			.then((info) => setVesselInfo(info))
			.catch(() => setVesselInfo(null));
	}, [selectedVessel]);

	const convertKnotsToKmh = (knots: number) => (knots * 1.852).toFixed(2);

	return (
		<>
			{/* Sidebar */}
			<Paper
				elevation={3}
				sx={{
					position: 'absolute',
					top: 60,
					right: 10,
					zIndex: 1000,
					width: 280,
					maxHeight: 'calc(100vh - 80px)',
					overflowY: 'auto',
					p: 2,
				}}
			>
				<Typography variant="h6" gutterBottom>
					AIS Vessel Tracker
				</Typography>
				<Typography variant="body2" color="text.secondary" gutterBottom>
					{vessels.length} vessels loaded
				</Typography>

				<Divider sx={{ my: 1 }} />

				<Typography variant="subtitle2">Filter by speed</Typography>
				<FormControlLabel
					control={
						<Checkbox
							checked={showStationary}
							onChange={() => setShowStationary((v) => !v)}
							size="small"
						/>
					}
					label={<Typography variant="body2">Stationary (0 kn)</Typography>}
				/>
				<FormControlLabel
					control={
						<Checkbox checked={showMoving} onChange={() => setShowMoving((v) => !v)} size="small" />
					}
					label={<Typography variant="body2">{'Moving (> 0 kn)'}</Typography>}
				/>

				{selectedVessel && (
					<>
						<Divider sx={{ my: 1 }} />
						<Typography variant="subtitle2">Selected vessel</Typography>
						<Box sx={{ mt: 1 }}>
							<Typography variant="body2">
								<b>MMSI:</b> {selectedVessel.mmsi}
							</Typography>
							<Typography variant="body2">
								<b>Nav status:</b> {NAV_STATS[selectedVessel.navStat] ?? selectedVessel.navStat}
							</Typography>
							<Typography variant="body2">
								<b>Speed:</b> {selectedVessel.velocity} kn (
								{convertKnotsToKmh(selectedVessel.velocity)} km/h)
							</Typography>
							<Typography variant="body2">
								<b>Accuracy:</b> {selectedVessel.accurancy ? 'high' : 'low'}
							</Typography>
							{vesselInfo && (
								<>
									<Typography variant="body2">
										<b>Name:</b> {(vesselInfo.name as string) || '--'}
									</Typography>
									<Typography variant="body2">
										<b>Callsign:</b> {(vesselInfo.callSign as string) || '--'}
									</Typography>
									<Typography variant="body2">
										<b>Destination:</b> {(vesselInfo.destination as string) || '--'}
									</Typography>
									<Typography variant="body2">
										<b>Ship type:</b> {getShipType(vesselInfo.shipType as number) || '--'}
									</Typography>
								</>
							)}
							<Button
								size="small"
								sx={{ mt: 1 }}
								onClick={() => {
									setSelectedVessel(null);
									setVesselInfo(null);
								}}
							>
								Clear selection
							</Button>
						</Box>
					</>
				)}
			</Paper>

			<MlIconLayer
				data={vessels}
				showMovingVessels={showMoving}
				showNotMovingVessels={showStationary}
				selectedVessel={selectedVessel}
				onVesselClick={setSelectedVessel}
			/>
		</>
	);
};

export const ExampleConfig: any = Template.bind({});
ExampleConfig.parameters = {};
ExampleConfig.args = {};
