import { css } from '@emotion/css';
import { type FC, useState } from 'react';
import { makeMapContextDecorators } from '../../decorators/MapContextDecorator';
import MlVehicleLayer, { type VehicleData } from './MlVehicleLayer';

// ─── Story config ─────────────────────────────────────────────────────────────

const storyOptions = {
	title: 'MapComponents/MlVehicleLayer',
	component: MlVehicleLayer,
	argTypes: {
		iconColor: { control: 'color' },
		iconStrokeColor: { control: 'color' },
		iconSize: { control: { type: 'range', min: 0.3, max: 2, step: 0.1 } },
		showLabel: { control: 'boolean' },
	},
	decorators: makeMapContextDecorators({
		center: [7.9717, 47.1997],
		zoom: 12,
	}),
};

export default storyOptions;

// ─── Mock data ────────────────────────────────────────────────────────────────

const MOCK_VEHICLES: VehicleData[] = [
	{
		longitude: 7.9717,
		latitude: 47.1997,
		truckIntNo: '297',
		heading: 247,
		eventCreatedDateTime: '2026-05-05T02:18:08+00:00',
	},
	{
		longitude: 7.992,
		latitude: 47.211,
		truckIntNo: '312',
		heading: 45,
		eventCreatedDateTime: '2026-05-05T02:18:10+00:00',
	},
	{
		longitude: 7.953,
		latitude: 47.216,
		truckIntNo: '405',
		heading: 180,
		eventCreatedDateTime: '2026-05-05T02:18:12+00:00',
	},
	{
		longitude: 7.998,
		latitude: 47.188,
		truckIntNo: '218',
		heading: 90,
		eventCreatedDateTime: '2026-05-05T02:18:05+00:00',
	},
	{
		longitude: 7.96,
		latitude: 47.183,
		truckIntNo: '533',
		heading: 320,
		eventCreatedDateTime: '2026-05-05T02:18:15+00:00',
	},
];

// ─── Styles ───────────────────────────────────────────────────────────────────

const infoPanel = css`
	position: fixed;
	bottom: 24px;
	left: 24px;
	min-width: 220px;
	background: #fff;
	border-radius: 10px;
	box-shadow: 0 4px 16px rgba(0, 0, 0, 0.18);
	padding: 14px 16px;
	z-index: 1300;
	font-size: 13px;
	line-height: 1.6;
	color: #1f2937;
`;

const infoPanelTitle = css`
	font-weight: 700;
	font-size: 15px;
	margin-bottom: 6px;
	display: flex;
	align-items: center;
	justify-content: space-between;
`;

const infoPanelClose = css`
	background: none;
	border: none;
	cursor: pointer;
	font-size: 16px;
	color: #6b7280;
	padding: 0 0 0 8px;
	line-height: 1;
	&:hover {
		color: #111827;
	}
`;

const badge = css`
	display: inline-block;
	padding: 2px 8px;
	border-radius: 99px;
	font-size: 11px;
	font-weight: 600;
	background: #dbeafe;
	color: #1d4ed8;
	margin-bottom: 6px;
`;

// ─── Default story ────────────────────────────────────────────────────────────

const Template: FC = () => {
	const [selected, setSelected] = useState<VehicleData | null>(null);
	const [hovered, setHovered] = useState<VehicleData | null>(null);
	return (
		<>
			<MlVehicleLayer
				mapId="map_1"
				vehicles={MOCK_VEHICLES}
				onVehicleClick={setSelected}
				onVehicleHover={setHovered}
			/>

			{/* Hover tooltip */}
			{hovered && !selected && (
				<div
					style={{
						position: 'fixed',
						bottom: 24,
						left: 24,
						background: 'rgba(0,0,0,0.75)',
						color: '#fff',
						borderRadius: 6,
						padding: '6px 12px',
						fontSize: 13,
						zIndex: 1300,
						pointerEvents: 'none',
					}}
				>
					Truck #{hovered.truckIntNo} — heading {hovered.heading}°
				</div>
			)}

			{/* Click info panel */}
			{selected && (
				<div className={infoPanel}>
					<div className={infoPanelTitle}>
						<span>Vehicle details</span>
						<button type="button" className={infoPanelClose} onClick={() => setSelected(null)}>
							✕
						</button>
					</div>
					<div className={badge}>Truck #{selected.truckIntNo}</div>
					<br />
					<strong>Heading:</strong> {selected.heading}°
					<br />
					<strong>Lat:</strong> {selected.latitude.toFixed(5)}
					<br />
					<strong>Lon:</strong> {selected.longitude.toFixed(5)}
					<br />
					<strong>Last event:</strong> {new Date(selected.eventCreatedDateTime).toLocaleString()}
				</div>
			)}
		</>
	);
};

export const VehicleLayer = Template.bind({});

// ─── Multiple colour groups story ─────────────────────────────────────────────

const MultiColorTemplate: FC = () => (
	<>
		{/* Blue fleet */}
		<MlVehicleLayer mapId="map_1" vehicles={MOCK_VEHICLES.slice(0, 3)} iconColor="#2563eb" />
		{/* Red fleet */}
		<MlVehicleLayer mapId="map_1" vehicles={MOCK_VEHICLES.slice(3)} iconColor="#dc2626" />
	</>
);

export const MultiColorFleets = MultiColorTemplate.bind({});

// ─── No-label story ───────────────────────────────────────────────────────────

const NoLabelTemplate: FC = () => (
	<MlVehicleLayer mapId="map_1" vehicles={MOCK_VEHICLES} showLabel={false} />
);

export const NoLabels = NoLabelTemplate.bind({});
