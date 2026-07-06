import { IconLayer } from '@deck.gl/layers';
import { useMap, useMapState } from 'react-libremap-components';
import { useEffect, useMemo, useRef, useState } from 'react';
import useDeckGl from '../../hooks/useDeckGl';
import ShipsPng from './assets/Ships.png';

/**
 * A single vessel record as returned by the Digitraffic AIS API
 * after being processed by the story's `formatData` callback.
 */
export interface VesselRecord {
	mmsi: number;
	/** Speed over ground in knots */
	velocity: number;
	navStat: number;
	/** Unix timestamp (ms) when the position was recorded */
	time_contact: number;
	longitude: number;
	latitude: number;
	/** Course over ground in degrees */
	true_track: number;
	accurancy: boolean;
	/**
	 * d3.geoInterpolate function: call with a 0-1 progress value to get the
	 * interpolated [lng, lat] position.
	 */
	interpolatePos: (t: number) => [number, number];
}

export interface MlIconLayerProps {
	/**
	 * Id of the target MapLibre instance in mapContext
	 */
	mapId?: string;
	/**
	 * Array of vessel records to render. Each record must include an
	 * `interpolatePos` function for smooth animation between data refreshes.
	 */
	data: VesselRecord[];
	/**
	 * Show vessels that are currently moving (velocity > 0).
	 * @default true
	 */
	showMovingVessels?: boolean;
	/**
	 * Show vessels that are stationary (velocity === 0).
	 * @default true
	 */
	showNotMovingVessels?: boolean;
	/**
	 * The currently selected vessel (highlights it with the "selected" icon).
	 */
	selectedVessel?: VesselRecord | null;
	/**
	 * Called when the user clicks a vessel icon.
	 */
	onVesselClick?: (vessel: VesselRecord) => void;
	/**
	 * How many seconds between consecutive data refreshes.
	 * Used to drive the position interpolation animation.
	 * @default 10
	 */
	fetchIntervalSeconds?: number;
}

const ICON_MAPPING = {
	moving: { x: 0, y: 0, width: 512, height: 512 },
	notmoving: { x: 512, y: 0, width: 512, height: 512 },
	selected: { x: 1024, y: 0, width: 512, height: 512 },
};

const MlIconLayer = (props: MlIconLayerProps) => {
	const {
		mapId,
		data,
		showMovingVessels = true,
		showNotMovingVessels = true,
		selectedVessel,
		onVesselClick,
		fetchIntervalSeconds = 10,
	} = props;

	const mapHook = useMap({ mapId });
	const deckGlHook = useDeckGl();
	const mapState = useMapState({ mapId, watch: { viewport: true } });

	const rawDataRef = useRef<VesselRecord[]>([]);
	const timerRef = useRef<number | null>(null);
	const frameRef = useRef(0);

	const [animatedData, setAnimatedData] = useState<VesselRecord[]>([]);
	const [size, setSize] = useState(30);

	// Keep rawData in sync whenever the `data` prop changes
	useEffect(() => {
		rawDataRef.current = [...data];
		frameRef.current = 0;
		// start / restart the animation loop
		if (timerRef.current !== null) cancelAnimationFrame(timerRef.current);
		const tick = () => {
			const now = Date.now();
			setAnimatedData(
				rawDataRef.current.map((d) => {
					const progress = (now - d.time_contact) / 1000 / fetchIntervalSeconds;
					const [longitude, latitude] = d.interpolatePos(progress);
					return { ...d, longitude, latitude };
				})
			);
			timerRef.current = requestAnimationFrame(tick);
		};
		timerRef.current = requestAnimationFrame(tick);
		return () => {
			if (timerRef.current !== null) cancelAnimationFrame(timerRef.current);
		};
	}, [data, fetchIntervalSeconds]);

	// Scale icon size with zoom level
	useEffect(() => {
		const zoom = mapState?.viewport?.zoom ?? 0;
		if (zoom <= 6) setSize(30);
		else if (zoom <= 11) setSize(50);
		else if (zoom <= 15) setSize(75);
		else setSize(100);
	}, [mapState?.viewport?.zoom]);

	const iconLayer = useMemo(() => {
		return new IconLayer<VesselRecord>({
			id: 'ml-icon-layer',
			data: animatedData,
			pickable: true,
			iconAtlas: ShipsPng,
			iconMapping: ICON_MAPPING,
			sizeScale: size,
			autoHighlight: true,
			getPosition: (d: VesselRecord) => [d.longitude, d.latitude] as [number, number],
			getIcon: (d: VesselRecord) => {
				if ((d.velocity === 0 && !showNotMovingVessels) || (d.velocity > 0 && !showMovingVessels)) {
					return 'notmoving'; // hide by returning smallest visible mapping
				}
				if (selectedVessel && d.mmsi === selectedVessel.mmsi) return 'selected';
				return d.velocity === 0 ? 'notmoving' : 'moving';
			},
			getAngle: (d: VesselRecord) => -d.true_track,
			onClick: (info: { object?: VesselRecord }) => {
				if (info.object) onVesselClick?.(info.object);
			},
		});
	}, [animatedData, size, showMovingVessels, showNotMovingVessels, selectedVessel, onVesselClick]);

	useEffect(() => {
		if (!mapHook.map) return;
		deckGlHook.addLayer(iconLayer);
		return () => {
			deckGlHook.removeLayer(iconLayer);
		};
		// eslint-disable-next-line react-hooks/exhaustive-deps
	}, [mapHook.map, iconLayer]);

	return null;
};

export default MlIconLayer;
