import { Box, IconButton, Paper } from '@mui/material';
import maplibregl from 'maplibre-gl';
import type React from 'react';
import { useEffect, useRef, useState } from 'react';
import { createPortal } from 'react-dom';
import useMap from '../../hooks/useMap';
import useMapContextMenu from '../../hooks/useMapContextMenu/useMapContextMenu';

// Constants for popup styling
const POPUP_PADDING_VERTICAL = 12;
const POPUP_PADDING_HORIZONTAL = 16;
const CLOSE_BUTTON_SPACING = 4;
// A conservative estimate for scrollbar width used to keep the close button
// clear of the scrollbar track. Actual width varies by OS and browser settings.
const SCROLLBAR_WIDTH = 16;
const CLOSE_BUTTON_OFFSET = SCROLLBAR_WIDTH + CLOSE_BUTTON_SPACING;
const POPUP_MIN_WIDTH = 200;
const POPUP_MAX_WIDTH = 750;
const POPUP_MAX_HEIGHT = 500;

/** Converts a camelCase CSS property name to its kebab-case equivalent. */
const toKebabCase = (str: string) => str.replace(/([A-Z])/g, '-$1').toLowerCase();

export interface MlMarkerProps {
	/** ID of the map to add the marker to */
	mapId?: string;
	/** Layer ID before which to insert the marker */
	insertBeforeLayer?: string;
	/** Longitude of the marker position */
	lng: number;
	/** Latitude of the marker position */
	lat: number;
	/**
	 * HTML content for the marker popup.
	 *
	 * ⚠️ Security note: Content is rendered inside an iframe with `allow-scripts`.
	 * Do **not** pass untrusted or user-generated HTML without sanitising it first,
	 * as scripts in the iframe can reach the parent page via `allow-same-origin`.
	 */
	content?: string;
	/** CSS properties to apply to the marker dot */
	markerStyle?: React.CSSProperties;
	/** CSS properties to apply to the content container */
	containerStyle?: React.CSSProperties;
	/** CSS properties to apply to the iframe element */
	iframeStyle?: React.CSSProperties;
	/** CSS properties to apply to the body of the iframe */
	iframeBodyStyle?: React.CSSProperties;
	/** Offset in pixels between the marker and its content */
	contentOffset?: number;
	/**
	 * When `true` (default), mouse events pass through the popup to the map below,
	 * allowing the user to pan and zoom without the popup blocking interaction.
	 * Set to `false` when the popup contains interactive elements such as buttons or links.
	 */
	passEventsThrough?: boolean;
	/** Whether to show a close button to remove the marker */
	showCloseButton?: boolean;
	/**
	 * Callback fired when the close button is clicked.
	 * When provided, the parent is responsible for unmounting the component.
	 * When omitted, the marker hides itself internally.
	 */
	onClose?: () => void;
	/**
	 * When provided, a "📍 Set center" item appears in the map's right-click
	 * context menu. The callback receives the clicked coordinates so the parent
	 * can update the `lng` / `lat` props to reposition the marker.
	 */
	onSetCenter?: (lng: number, lat: number) => void;
	/** Anchor position of the marker relative to its coordinates */
	anchor?:
		| 'top'
		| 'bottom'
		| 'left'
		| 'right'
		| 'top-left'
		| 'top-right'
		| 'bottom-left'
		| 'bottom-right';
}

const getBoxTransform = (anchor: MlMarkerProps['anchor'] = 'top') => {
	switch (anchor) {
		case 'bottom':
			return 'translate(-50%, 0%)';
		case 'left':
			return 'translate(-100%, -50%)';
		case 'right':
			return 'translate(0%, -50%)';
		case 'top-left':
			return 'translate(-100%, -100%)';
		case 'top-right':
			return 'translate(0%, -100%)';
		case 'bottom-left':
			return 'translate(-100%, 0%)';
		case 'bottom-right':
			return 'translate(0%, 0%)';
		default:
			return 'translate(-50%, -100%)';
	}
};

function getBoxMargins(
	anchor: MlMarkerProps['anchor'],
	offset: number,
	style?: React.CSSProperties
) {
	// Defaults match the 12 × 12 px defaultMarkerStyle dot defined below.
	const w = parseInt(String(style?.width || 12), 10);
	const h = parseInt(String(style?.height || 12), 10);
	const m: Record<string, string> = {};
	switch (anchor) {
		case 'bottom':
			m.marginTop = `${offset}px`;
			break;
		case 'left':
			m.marginLeft = `-${offset}px`;
			break;
		case 'right':
			m.marginLeft = `${w + offset}px`;
			break;
		case 'top-left':
			m.marginTop = `-${h + offset}px`;
			m.marginLeft = `-${offset}px`;
			break;
		case 'top-right':
			m.marginTop = `-${h + offset}px`;
			m.marginLeft = `${w + offset}px`;
			break;
		case 'bottom-left':
			m.marginTop = `${offset}px`;
			m.marginLeft = `-${offset}px`;
			break;
		case 'bottom-right':
			m.marginTop = `${offset}px`;
			m.marginLeft = `${w + offset}px`;
			break;
		default:
			m.marginTop = `-${h + offset}px`;
			break;
	}
	return m;
}

const MlMarker = ({
	passEventsThrough = true,
	contentOffset = 5,
	showCloseButton = true,
	...props
}: MlMarkerProps) => {
	const mapHook = useMap({
		mapId: props.mapId,
		waitForLayer: props.insertBeforeLayer,
	});

	const [popupVisible, setPopupVisible] = useState(true);
	const [contentWidth, setContentWidth] = useState<number>(300);
	const [iframeHeight, setIframeHeight] = useState<string | undefined>(undefined);
	const container = useRef<HTMLDivElement | null>(null);
	const iframeRef = useRef<HTMLIFrameElement | null>(null);

	const handleClose = (event: React.MouseEvent) => {
		event.stopPropagation();
		if (props.onClose) {
			props.onClose();
		} else {
			// Hide the popup only — the marker dot stays on the map.
			// Clicking the dot will bring the popup back.
			setPopupVisible(false);
		}
	};

	useEffect(() => {
		if (!mapHook.map) return;

		// Inject the glow keyframe once — shared across all MlMarker instances on the page.
		const GLOW_STYLE_ID = 'ml-marker-glow-keyframe';
		if (!document.getElementById(GLOW_STYLE_ID)) {
			const styleEl = document.createElement('style');
			styleEl.id = GLOW_STYLE_ID;
			styleEl.textContent = [
				'@keyframes ml-marker-glow {',
				'  0%   { box-shadow: 0 0 4px 1px rgba(96,209,253,0.6), 0 0 0 0px rgba(96,209,253,0.4); }',
				'  50%  { box-shadow: 0 0 8px 3px rgba(96,209,253,0.9), 0 0 0 7px rgba(96,209,253,0.15); }',
				'  100% { box-shadow: 0 0 4px 1px rgba(96,209,253,0.6), 0 0 0 0px rgba(96,209,253,0); }',
				'}',
			].join('\n');
			document.head.appendChild(styleEl);
		}

		container.current = document.createElement('div');

		const defaultMarkerStyle = {
			width: '12px',
			height: '12px',
			background: 'linear-gradient(135deg, rgb(186, 208, 218) 0%, rgb(96, 209, 253) 100%)',
			border: '1px solid rgba(255, 255, 255, 0.7)',
			borderRadius: '50%',
			// Pulsing glow: inner light + expanding ring that fades out.
			// Override via markerStyle prop to disable or restyle.
			animation: 'ml-marker-glow 2s ease-in-out infinite',
		};
		const markerStyle = {
			...defaultMarkerStyle,
			...props.markerStyle,
		};

		const maplibreMarker = new maplibregl.Marker({
			element: container.current,
			anchor: 'center',
		})
			.setLngLat([props.lng, props.lat])
			.addTo(mapHook.map.map);

		const markerDot = document.createElement('div');
		Object.entries(markerStyle).forEach(([key, value]) => {
			markerDot.style.setProperty(toKebabCase(key), String(value));
		});
		// Indicate the dot is clickable and let the user re-open the popup.
		markerDot.style.cursor = 'pointer';
		const handleDotClick = () => setPopupVisible((prev) => !prev);
		markerDot.addEventListener('click', handleDotClick);
		container.current.appendChild(markerDot);

		return () => {
			markerDot.removeEventListener('click', handleDotClick);
			markerDot.remove();
			maplibreMarker.remove();
			container.current?.remove();
		};
	}, [mapHook.map, props.lng, props.lat, props.markerStyle, props.anchor]);

	// Reset iframe dimensions whenever content changes so the popup does not
	// briefly display at the previous content's size while the new iframe loads.
	useEffect(() => {
		setContentWidth(300);
		setIframeHeight(undefined);
	}, [props.content]);

	function handleIframeLoad() {
		const iframeDoc = iframeRef.current?.contentWindow?.document;
		if (iframeDoc) {
			const scrollHeight = iframeDoc.documentElement.scrollHeight;
			const scrollWidth = iframeDoc.documentElement.scrollWidth;

			setIframeHeight(`${scrollHeight}px`);

			// Clamp width between POPUP_MIN_WIDTH and POPUP_MAX_WIDTH.
			const calculatedWidth = Math.max(
				POPUP_MIN_WIDTH,
				Math.min(scrollWidth + POPUP_PADDING_HORIZONTAL * 2, POPUP_MAX_WIDTH)
			);
			setContentWidth(calculatedWidth);
		}
	}

	useMapContextMenu({
		mapId: props.mapId,
		getItems: ({ longitude, latitude, closeMenu: _ }) => [
			{
				content: '✈️ Fly to center',
				onClick: () => {
					mapHook.map?.map.flyTo({ center: [props.lng, props.lat] });
				},
			},
			...(props.onSetCenter
				? [
						{
							content: '📍 Set center',
							divider: true as const,
							onClick: () => {
								props.onSetCenter?.(longitude, latitude);
							},
						},
					]
				: []),
		],
	});

	// Dot always stays on the map; popup portal is only rendered when visible.
	const popupPortal =
		container.current && popupVisible
			? createPortal(
					<Box
						sx={{
							position: 'absolute',
							transform: getBoxTransform(props.anchor),
							...getBoxMargins(props.anchor, contentOffset, props.markerStyle),
							// zIndex -1 keeps the popup card behind the marker dot within the same
							// marker container element so the dot always appears on top visually.
							zIndex: -1,
							...props.containerStyle,
						}}
					>
						<Paper
							elevation={8}
							sx={{
								width: `${contentWidth}px`,
								maxWidth: '90vw',
								// When passEventsThrough is true the popup is slightly transparent and
								// pointer events fall through to the map, allowing pan/zoom as normal.
								opacity: passEventsThrough ? 0.85 : 1,
								pointerEvents: passEventsThrough ? 'none' : 'auto',
								overflow: 'hidden',
								position: 'relative',
								transition: 'opacity 0.2s ease-in-out, width 0.2s ease-in-out',
								'&:hover': {
									opacity: 1,
								},
							}}
						>
							{showCloseButton && (
								<IconButton
									onClick={handleClose}
									sx={{
										position: 'absolute',
										top: CLOSE_BUTTON_SPACING,
										right: CLOSE_BUTTON_OFFSET,
										zIndex: 1,
										padding: '4px',
										// Always interactive regardless of the parent's pointer-events setting.
										pointerEvents: 'auto',
										backgroundColor: 'rgba(255, 255, 255, 0.9)',
										'&:hover': {
											backgroundColor: 'rgba(255, 255, 255, 1)',
										},
									}}
									size="small"
								>
									<svg
										focusable="false"
										aria-hidden="true"
										viewBox="0 0 24 24"
										data-testid="CloseIcon"
										style={{
											width: '1.25rem',
											height: '1.25rem',
											fill: 'currentColor',
											display: 'inline-block',
										}}
									>
										<path d="M19 6.41 17.59 5 12 10.59 6.41 5 5 6.41 10.59 12 5 17.59 6.41 19 12 13.41 17.59 19 19 17.59 13.41 12z"></path>
									</svg>
								</IconButton>
							)}
							<Box
								sx={{
									maxHeight: `${POPUP_MAX_HEIGHT}px`,
									overflowY: 'auto',
									overflowX: 'hidden',
								}}
							>
								<iframe
									ref={iframeRef}
									onLoad={handleIframeLoad}
									style={{
										width: '100%',
										height: iframeHeight,
										border: 'none',
										display: 'block',
										...props.iframeStyle,
									}}
									srcDoc={`<div>
	<style>
		* {
			box-sizing: border-box;
		}
		body {
			margin: 0;
			padding: ${POPUP_PADDING_VERTICAL}px ${POPUP_PADDING_HORIZONTAL}px;
			${showCloseButton ? 'padding-top: 40px;' : ''}
			background: transparent;
			font-family: -apple-system, BlinkMacSystemFont, 'Segoe UI', 'Roboto', 'Oxygen', 'Ubuntu', 'Cantarell', 'Fira Sans', 'Droid Sans', 'Helvetica Neue', sans-serif;
			font-size: 14px;
			line-height: 1.6;
			color: rgba(0, 0, 0, 0.87);
			-webkit-font-smoothing: antialiased;
			-moz-osx-font-smoothing: grayscale;
			overflow-x: hidden;
			${Object.entries(props.iframeBodyStyle || {})
				.map(([key, val]) => `${toKebabCase(key)}: ${val};`)
				.join(' ')}
		}
		h1, h2, h3, h4, h5, h6 {
			margin: 0 0 8px 0;
			font-weight: 500;
		}
		p {
			margin: 0 0 8px 0;
		}
		table {
			border-collapse: collapse;
			width: 100%;
			max-width: 100%;
		}
		th, td {
			padding: 4px 8px;
			text-align: left;
			border-bottom: 1px solid rgba(0, 0, 0, 0.12);
			word-wrap: break-word;
		}
		th {
			font-weight: 500;
			color: rgba(0, 0, 0, 0.6);
		}
		img {
			max-width: 100%;
			height: auto;
		}
	</style>
	${props.content || ''}
</div>`}
									sandbox="allow-same-origin allow-popups-to-escape-sandbox allow-scripts"
									title={mapHook.componentId}
								/>
							</Box>
						</Paper>
					</Box>,
					container.current
				)
			: null;

	return <>{popupPortal}</>;
};

export default MlMarker;
