import type { FeatureCollection, GeoJsonProperties, Point } from 'geojson';
import { useCallback, useEffect, useMemo, useRef } from 'react';
import useLayer from '../../hooks/useLayer';
import useMap from '../../hooks/useMap';
import useSource from '../../hooks/useSource';
import type { TruckIconVariant } from './VehicleIcon';
import { TRUCK_ICON_COLORS } from './VehicleIcon';

// ─── Constants ────────────────────────────────────────────────────────────────

const VEHICLE_ICON_BASE_ID = 'ml-vehicle-icon';
/** Native size of the SVG design (matches TruckIcon.tsx viewBox). */
const SVG_SIZE = 120;
/** Font size used for the label layer (px = ems baseline). */
const LABEL_TEXT_SIZE = 12;

// ─── SVG template ─────────────────────────────────────────────────────────────

/**
 * Returns a compact SVG string for the truck icon.
 * The path data is taken verbatim from TruckIcon.tsx so the two always match.
 * Using a standalone SVG document (not inline in HTML) means simple local IDs
 * ("f" / "c") are safe — they don't pollute the page's global ID namespace.
 */
const buildTruckSvgString = (primaryColor: string, stripeColor: string): string =>
	`<svg width="${SVG_SIZE}" height="${SVG_SIZE}" viewBox="0 0 70 70" fill="none" xmlns="http://www.w3.org/2000/svg">` +
	`<g clip-path="url(#c)"><g filter="url(#f)">` +
	`<path d="M39.8 65.3999H38V69.3999H39.8V65.3999Z" fill="#E1E2E2"/>` +
	`<path d="M40.4618 1.63977C40.3458 1.13577 39.8978 0.759766 39.3598 0.759766C38.8218 0.759766 38.3738 1.13577 38.2598 1.63977H40.4618Z" fill="#FDEDBC"/>` +
	`<path d="M31.2352 1.63977C31.1192 1.13577 30.6712 0.759766 30.1332 0.759766C29.5952 0.759766 29.1472 1.13577 29.0332 1.63977H31.2352Z" fill="#FDEDBC"/>` +
	`<path d="M41.5496 2.1999C41.5496 2.6219 41.3796 2.9999 41.1696 2.9999H28.2316C28.0216 2.9999 27.8516 2.6219 27.8516 2.1999C27.8516 1.7759 28.0216 1.3999 28.2316 1.3999H41.1696C41.3796 1.3999 41.5496 1.7759 41.5496 2.1999Z" fill="#000D20"/>` +
	`<path d="M37.6008 1.19971H31.8008V1.79971H37.6008V1.19971Z" fill="#FDEDBC"/>` +
	`<path d="M41.3555 16.734V3.836C41.3555 2.844 40.6915 2.104 40.2795 2.104H29.0155C28.5635 2.104 27.8555 2.886 27.8555 3.906V16.736H41.3555V16.734Z" fill="${primaryColor}"/>` +
	`<path d="M34.6056 7.12793C33.2696 7.12793 30.4436 7.42793 29.2676 8.03393L31.1396 13.3999H38.0736L39.9456 8.03393C38.7676 7.42793 35.9436 7.12793 34.6076 7.12793H34.6056Z" fill="black"/>` +
	`<path d="M30.4628 13.8479L28.8008 9.35791V15.9999H30.3948L30.4628 13.8479Z" fill="black"/>` +
	`<path d="M38.9512 13.8479L40.5992 9.35791V15.9999H39.0332L38.9512 13.8479Z" fill="black"/>` +
	`<g opacity="0.4" style="mix-blend-mode:multiply"><path d="M37.2004 4.19971H32.4004V4.79971H37.2004V4.19971Z" fill="${stripeColor}"/></g>` +
	`<g opacity="0.4" style="mix-blend-mode:multiply"><path d="M37.2004 4.99951H32.4004V5.59951H37.2004V4.99951Z" fill="${stripeColor}"/></g>` +
	`<g opacity="0.4" style="mix-blend-mode:multiply"><path d="M37.2004 5.7998H32.4004V6.3998H37.2004V5.7998Z" fill="${stripeColor}"/></g>` +
	`<path d="M41.4008 16.5996H27.8008V17.9996H41.4008V16.5996Z" fill="#000D20"/>` +
	`<path d="M38.2 17.7998H31V19.1998H38.2V17.7998Z" fill="#000D20"/>` +
	`<path d="M43.0004 19H26.4004V67.4H43.0004V19Z" fill="#C7C8C8"/>` +
	`<path d="M42.1992 19.7998H27.1992V66.5998H42.1992V19.7998Z" fill="${primaryColor}"/>` +
	`<g opacity="0.4" style="mix-blend-mode:multiply"><path d="M27.1992 66.5998L42.1992 19.7998V66.5998H27.1992Z" fill="${primaryColor}"/></g>` +
	`<path d="M43.0004 67.1997H26.4004V68.1997H43.0004V67.1997Z" fill="#000D20"/>` +
	`<path d="M28.6004 67.1997H26.4004V68.1997H28.6004V67.1997Z" fill="#F4911C"/>` +
	`<path d="M43.0008 67.1997H40.8008V68.1997H43.0008V67.1997Z" fill="#F4911C"/>` +
	`<path d="M28.8003 9.24985C28.7023 8.65185 28.1843 8.19385 27.5583 8.19385H26.4803C25.8543 8.19385 25.3363 8.65185 25.2383 9.24985H28.8023H28.8003Z" fill="${primaryColor}"/>` +
	`<path d="M43.9819 9.24985C43.8839 8.65185 43.3659 8.19385 42.7399 8.19385H41.6619C41.0359 8.19385 40.5179 8.65185 40.4199 9.24985H43.9839H43.9819Z" fill="${primaryColor}"/>` +
	`</g></g>` +
	`<defs>` +
	`<filter id="f" x="25.2383" y="-1.24023" width="22.7461" height="72.6401" filterUnits="userSpaceOnUse" color-interpolation-filters="sRGB">` +
	`<feFlood flood-opacity="0" result="BackgroundImageFix"/>` +
	`<feColorMatrix in="SourceAlpha" type="matrix" values="0 0 0 0 0 0 0 0 0 0 0 0 0 0 0 0 0 0 127 0" result="hardAlpha"/>` +
	`<feOffset dx="2"/><feGaussianBlur stdDeviation="1"/>` +
	`<feColorMatrix type="matrix" values="0 0 0 0 0 0 0 0 0 0 0 0 0 0 0 0 0 0 0.2 0"/>` +
	`<feBlend mode="normal" in2="BackgroundImageFix" result="effect1_dropShadow"/>` +
	`<feBlend mode="normal" in="SourceGraphic" in2="effect1_dropShadow" result="shape"/>` +
	`</filter>` +
	`<clipPath id="c"><rect width="70" height="70" fill="white"/></clipPath>` +
	`</defs></svg>`;

// ─── Icon factory ─────────────────────────────────────────────────────────────

/**
 * Renders the SVG truck to an off-screen canvas and returns ImageData.
 *
 * We use Blob → object URL → HTMLImageElement → Canvas instead of a
 * base64-encoded data URL because some browsers refuse to decode base64 SVGs
 * when passed to `HTMLImageElement.src` (InvalidStateError).
 *
 * The truck number is painted directly onto the cargo-body area of the
 * canvas so it rotates with the vehicle heading — giving immediate spatial
 * context when the user glances at the map.
 */
const createTruckImageData = (
	primaryColor: string,
	stripeColor: string,
	truckIntNo: string
): Promise<ImageData> =>
	new Promise((resolve, reject) => {
		const svg = buildTruckSvgString(primaryColor, stripeColor);
		const blob = new Blob([svg], { type: 'image/svg+xml;charset=utf-8' });
		const url = URL.createObjectURL(blob);

		const img = new Image(SVG_SIZE, SVG_SIZE);

		img.onload = () => {
			URL.revokeObjectURL(url);

			const canvas = document.createElement('canvas');
			canvas.width = SVG_SIZE;
			canvas.height = SVG_SIZE;
			const ctx = canvas.getContext('2d');
			if (!ctx) return reject(new Error('MlVehicleLayer: could not get 2d canvas context'));

			// 1. Draw the SVG truck.
			ctx.drawImage(img, 0, 0, SVG_SIZE, SVG_SIZE);

			// 2. Draw the truck number inside the cargo-body.
			//    The body inner panel spans x ≈ 27–42, y ≈ 20–67 in the 70 px space.
			//    We place the text at the visual centre of that panel.
			const textX = (27 + 42) / 2; // ≈ 34.5
			const textY = (20 + 67) / 2; // ≈ 43.5

			// Rotate 90° so the number reads "upright" along the body when the
			// truck is viewed from the side.  The truck points north (up), so
			// after rotation the text runs top→bottom along the cargo body.
			ctx.save();
			ctx.translate(textX, textY);
			ctx.rotate(-Math.PI / 2);

			const fontSize = 8;
			ctx.font = `bold ${fontSize}px sans-serif`;
			ctx.textAlign = 'center';
			ctx.textBaseline = 'middle';

			// Comic-caption style: solid white pill with black border + black text.
			const textWidth = ctx.measureText(truckIntNo).width;
			const paddingX = 2;
			const paddingY = 1.5;
			const rectW = textWidth + paddingX * 2;
			const rectH = fontSize + paddingY * 2;
			const rectX = -rectW / 2;
			const rectY = -rectH / 2;
			const radius = 2;

			// Build the rounded-rect path once and reuse it for fill + stroke.
			const roundRect = () => {
				ctx.beginPath();
				ctx.moveTo(rectX + radius, rectY);
				ctx.lineTo(rectX + rectW - radius, rectY);
				ctx.arcTo(rectX + rectW, rectY, rectX + rectW, rectY + radius, radius);
				ctx.lineTo(rectX + rectW, rectY + rectH - radius);
				ctx.arcTo(rectX + rectW, rectY + rectH, rectX + rectW - radius, rectY + rectH, radius);
				ctx.lineTo(rectX + radius, rectY + rectH);
				ctx.arcTo(rectX, rectY + rectH, rectX, rectY + rectH - radius, radius);
				ctx.lineTo(rectX, rectY + radius);
				ctx.arcTo(rectX, rectY, rectX + radius, rectY, radius);
				ctx.closePath();
			};

			// 1. Solid white fill.
			roundRect();
			ctx.fillStyle = '#ffffff';
			ctx.fill();

			// 2. Thin black border.
			roundRect();
			ctx.strokeStyle = '#000000';
			ctx.lineWidth = 0.75;
			ctx.stroke();

			// 3. Black text on top.
			ctx.fillStyle = '#000000';
			ctx.fillText(truckIntNo, 0, 0);

			ctx.restore();

			resolve(ctx.getImageData(0, 0, SVG_SIZE, SVG_SIZE));
		};

		img.onerror = (err) => {
			URL.revokeObjectURL(url);
			reject(err);
		};

		img.src = url;
	});

// ─── GeoJSON helper ───────────────────────────────────────────────────────────

/**
 * Converts the vehicles array to a GeoJSON FeatureCollection.
 * Each feature carries an `iconId` property so the symbol layer can select
 * the correct pre-loaded sprite per truck (different number painted on it).
 */
const vehiclesToGeoJSON = (
	vehicles: VehicleData[],
	baseIconId: string
): FeatureCollection<Point, GeoJsonProperties> => ({
	type: 'FeatureCollection',
	features: vehicles.map((v) => ({
		type: 'Feature',
		geometry: {
			type: 'Point',
			coordinates: [v.longitude, v.latitude],
		},
		properties: {
			truckIntNo: v.truckIntNo,
			heading: v.heading,
			eventCreatedDateTime: v.eventCreatedDateTime,
			// Each truck gets its own sprite so the number is baked into the icon.
			iconId: `${baseIconId}-${v.truckIntNo}`,
		},
	})),
});

// ─── Public types ─────────────────────────────────────────────────────────────

export interface VehicleData {
	/** Longitude (WGS-84) */
	longitude: number;
	/** Latitude (WGS-84) */
	latitude: number;
	/** Truck internal number / label shown on the map and on the icon */
	truckIntNo: string;
	/** Heading in degrees clockwise from north (0–360) */
	heading: number;
	/** ISO 8601 timestamp of the last GPS event */
	eventCreatedDateTime: string;
}

export interface MlVehicleLayerProps {
	/** Id of the target MapLibre instance in mapContext */
	mapId?: string;
	/**
	 * Id of an existing layer in the mapLibre instance to help specify the
	 * layer order. This layer will be rendered visually beneath that layer.
	 */
	insertBeforeLayer?: string;
	/** Array of vehicle positions to render */
	vehicles: VehicleData[];
	/** Explicit layer id prefix; a random UUID is appended automatically */
	layerId?: string;
	/**
	 * One of the 12 design-approved colour variants from TruckIcon.
	 * When set, `iconColor` and `iconStripeColor` are ignored.
	 * @example "blue-01" | "red-02" | "green-01"
	 */
	iconVariant?: TruckIconVariant;
	/**
	 * Primary body colour of the truck icon (CSS colour string).
	 * Ignored when `iconVariant` is set.
	 * @default "#2563eb"
	 */
	iconColor?: string;
	/**
	 * Accent / stripe colour inside the cab (CSS colour string).
	 * Defaults to `iconColor` when not provided.
	 * Ignored when `iconVariant` is set.
	 */
	iconStripeColor?: string;
	/**
	 * MapLibre `icon-size` multiplier.
	 * The SVG is 70 × 70 px native, so 0.5 renders it at 35 px on-screen.
	 * @default 0.5
	 */
	iconSize?: number;
	/**
	 * When `true`, a readable label showing `truckIntNo` is displayed
	 * below the icon (viewport-aligned, always upright).
	 * The number is also painted directly on the icon's cargo body.
	 * @default true
	 */
	showLabel?: boolean;
	/** Called when a vehicle icon is clicked */
	onVehicleClick?: (vehicle: VehicleData) => void;
	/** Called when a vehicle icon is hovered (`null` on mouse-leave) */
	onVehicleHover?: (vehicle: VehicleData | null) => void;
}

// ─── Component ────────────────────────────────────────────────────────────────

/**
 * Renders a fleet of vehicles on the map as directional truck icons.
 *
 * Each truck icon automatically rotates to match the vehicle's `heading`
 * (degrees clockwise from north).  The `truckIntNo` is painted on the
 * cargo-body area of the icon and optionally shown as a label below.
 *
 * Must be rendered inside a `<MapComponentsProvider>` tree that also contains
 * a `<MapLibreMap mapId="..." />`.
 *
 * @example
 * ```tsx
 * // Predefined colour variant
 * <MlVehicleLayer mapId="map_1" vehicles={vehicles} iconVariant="blue-01" />
 *
 * // Custom colour
 * <MlVehicleLayer mapId="map_1" vehicles={vehicles} iconColor="#7c3aed" />
 * ```
 */
const MlVehicleLayer = (props: MlVehicleLayerProps) => {
	const {
		mapId,
		insertBeforeLayer,
		vehicles,
		iconVariant,
		iconColor = '#2563eb',
		iconStripeColor,
		iconSize = 0.5,
		showLabel = true,
		onVehicleClick,
		onVehicleHover,
	} = props;

	// Resolve the final primary / stripe colours.
	// iconVariant takes precedence over explicit colour props.
	const primaryColor = iconVariant ? TRUCK_ICON_COLORS[iconVariant].primaryColor : iconColor;
	const stripeColor = iconVariant
		? TRUCK_ICON_COLORS[iconVariant].stripeColor
		: (iconStripeColor ?? iconColor);

	const mapHook = useMap({ mapId, waitForLayer: insertBeforeLayer });

	// Stable IDs that persist across re-renders
	const compId = useRef(`MlVehicleLayer-${crypto.randomUUID()}`);
	const sourceId = useRef(`${compId.current}-source`);
	const layerId = useRef(props.layerId || `${compId.current}-icons`);
	const labelLayerId = useRef(`${compId.current}-labels`);

	/**
	 * The base icon id is keyed by colour, not by truck number.
	 * Per-truck icons are named `${baseIconId}-${truckIntNo}`.
	 */
	const baseIconId = `${VEHICLE_ICON_BASE_ID}-${primaryColor.replace('#', '')}-${stripeColor.replace('#', '')}`;

	// Track which per-truck icons this instance has registered so we can
	// clean them up without disturbing icons owned by other instances.
	const registeredIconIds = useRef<Set<string>>(new Set());

	// GeoJSON: each feature carries its own iconId property.
	const geojson = useMemo(
		() => vehiclesToGeoJSON(vehicles, baseIconId),
		// eslint-disable-next-line react-hooks/exhaustive-deps
		[vehicles, baseIconId]
	);

	// ── Load / refresh per-truck icons ────────────────────────────────────
	useEffect(() => {
		if (!mapHook.map) return;
		let cancelled = false;

		const toLoad = vehicles.filter((v) => {
			const id = `${baseIconId}-${v.truckIntNo}`;
			return !mapHook.map?.map.hasImage(id);
		});

		if (toLoad.length === 0) return;

		Promise.all(
			toLoad.map((v) =>
				createTruckImageData(primaryColor, stripeColor, v.truckIntNo).then((imageData) => ({
					id: `${baseIconId}-${v.truckIntNo}`,
					imageData,
				}))
			)
		)
			.then((results) => {
				if (cancelled || !mapHook.map) return;
				for (const { id, imageData } of results) {
					if (!mapHook.map.map.hasImage(id)) {
						mapHook.map.addImage(id, imageData, mapHook.componentId);
						registeredIconIds.current.add(id);
					}
				}
			})
			.catch(() => {
				// Silently swallow — icons just won't appear until the next render.
			});

		return () => {
			cancelled = true;
		};
	}, [mapHook.map, vehicles, baseIconId, primaryColor, stripeColor]);

	// ── Remove icons on unmount ───────────────────────────────────────────
	useEffect(
		() => () => {
			for (const id of registeredIconIds.current) {
				if (mapHook.map?.map.hasImage(id)) {
					mapHook.map.map.removeImage(id);
				}
			}
			registeredIconIds.current.clear();
		},
		// intentionally empty — we only want this to run on unmount
		// eslint-disable-next-line react-hooks/exhaustive-deps
		[]
	);

	// ── Event handlers ────────────────────────────────────────────────────
	const handleClick = useCallback(
		(ev: any) => {
			if (!onVehicleClick || !ev?.features?.[0]) return;
			const { properties, geometry } = ev.features[0];
			onVehicleClick({
				longitude: geometry.coordinates[0],
				latitude: geometry.coordinates[1],
				truckIntNo: properties.truckIntNo,
				heading: properties.heading,
				eventCreatedDateTime: properties.eventCreatedDateTime,
			});
		},
		[onVehicleClick]
	);

	const handleHover = useCallback(
		(ev: any) => {
			if (!ev?.features?.[0]) return;
			const { properties, geometry } = ev.features[0];
			onVehicleHover?.({
				longitude: geometry.coordinates[0],
				latitude: geometry.coordinates[1],
				truckIntNo: properties.truckIntNo,
				heading: properties.heading,
				eventCreatedDateTime: properties.eventCreatedDateTime,
			});
			if (mapHook.map?.map) {
				mapHook.map.map.getCanvas().style.cursor = 'pointer';
			}
		},
		[onVehicleHover, mapHook.map]
	);

	const handleLeave = useCallback(() => {
		onVehicleHover?.(null);
		if (mapHook.map?.map) {
			mapHook.map.map.getCanvas().style.cursor = '';
		}
	}, [onVehicleHover, mapHook.map]);

	// ── GeoJSON source ────────────────────────────────────────────────────
	useSource({
		mapId,
		sourceId: sourceId.current,
		source: {
			type: 'geojson',
			data: geojson as unknown as string,
		},
	});

	// ── Icon / symbol layer ───────────────────────────────────────────────
	// icon-image uses a data-driven expression so each feature picks its own
	// pre-loaded sprite (the one with its truckIntNo painted on it).
	useLayer({
		mapId,
		layerId: layerId.current,
		insertBeforeLayer,
		options: {
			type: 'symbol',
			source: sourceId.current,
			layout: {
				'icon-image': ['get', 'iconId'] as any,
				'icon-size': iconSize,
				'icon-rotate': ['get', 'heading'] as any,
				'icon-rotation-alignment': 'map',
				'icon-pitch-alignment': 'map',
				'icon-allow-overlap': true,
				'icon-ignore-placement': true,
			},
		},
		onClick: onVehicleClick ? (handleClick as any) : undefined,
		onHover: onVehicleHover ? (handleHover as any) : undefined,
		onLeave: onVehicleHover ? (handleLeave as any) : undefined,
	});

	useLayer({
		mapId,
		layerId: labelLayerId.current,
		insertBeforeLayer,
		options: {
			type: 'symbol',
			source: sourceId.current,
			layout: {
				'text-field': ['get', 'truckIntNo'] as any,
				// Provide several fallback fonts so the label renders even when the
				// map style only ships a subset of the Open Sans family.
				'text-font': ['Open Sans Bold', 'Open Sans Regular', 'Arial Unicode MS Bold'],
				'text-size': LABEL_TEXT_SIZE,
				'text-offset': [0, 0],
				'text-anchor': 'top',
				// Keep text upright regardless of the icon's rotation.
				'text-rotation-alignment': 'viewport',
				'text-allow-overlap': true,
				'text-ignore-placement': true,
				visibility: showLabel ? 'visible' : 'none',
			},
			paint: {
				'text-color': '#111827',
				'text-halo-color': '#ffffff',
				'text-halo-width': 2,
				'text-halo-blur': 0.5,
			},
		},
	});

	return null;
};

export default MlVehicleLayer;
