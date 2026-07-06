import type { FeatureCollection } from 'geojson';
import {
	useCallback,
	useEffect,
	useMemo,
	useRef,
	useState,
	type KeyboardEvent as ReactKeyboardEvent,
} from 'react';
import useLayer from '../../hooks/useLayer';
import useMap from '../../hooks/useMap';
import useMapContextMenu, {
	type MapContextMenuClickContext,
	type MapContextMenuItem,
} from '../../hooks/useMapContextMenu/useMapContextMenu';
import useSource from '../../hooks/useSource';

// ─── Types ────────────────────────────────────────────────────────────────────

/** A single text annotation placed on the map. */
export interface TextAnnotation {
	/** Unique identifier */
	id: string;
	/** WGS-84 longitude */
	longitude: number;
	/** WGS-84 latitude */
	latitude: number;
	/** The text string to display */
	text: string;
	/** CSS colour string (e.g. "#111827") */
	color: string;
	/** Font size in pixels */
	fontSize: number;
}

export interface MlTextLayerProps {
	/** Id of the target MapLibre instance in mapContext */
	mapId?: string;
	/**
	 * Id of an existing layer in the mapLibre instance to help specify the
	 * layer order. This layer will be rendered visually beneath that layer.
	 */
	insertBeforeLayer?: string;
	/**
	 * Controlled list of annotations.
	 * When provided the component is fully controlled – call `onAnnotationsChange`
	 * to persist edits. Omit to use the built-in uncontrolled state.
	 */
	annotations?: TextAnnotation[];
	/** Called whenever the annotation list changes (add / edit / delete). */
	onAnnotationsChange?: (annotations: TextAnnotation[]) => void;
	/**
	 * Default text colour applied to freshly created annotations.
	 * @default "#111827"
	 */
	defaultColor?: string;
	/**
	 * Default font size (px) applied to freshly created annotations.
	 * @default 14
	 */
	defaultFontSize?: number;
}

// ─── Annotation background sprite ───────────────────────────────────────────
//
// A stretchable white rounded-rect sprite is registered as a MapLibre image
// and used as icon-image with icon-text-fit:'both' so every annotation gets
// a clearly visible background panel that stretches to fit its text.

const ANNOTATION_BG_SPRITE_ID = 'ml-text-annotation-bg';

/**
 * Draws a 32×32 white rounded-rectangle with a blue border onto an
 * off-screen canvas and returns the raw ImageData.
 *
 * The stretch zones and content box are chosen so that MapLibre can
 * tile the centre of the sprite to any width/height while keeping the
 * 8 px corner arcs pixel-perfect.
 */
function createAnnotationBgSprite(): ImageData {
	const W = 32;
	const H = 32;
	const canvas = document.createElement('canvas');
	canvas.width = W;
	canvas.height = H;
	const ctx = canvas.getContext('2d');
	if (!ctx) throw new Error('MlTextLayer: could not get 2d canvas context');

	const r = 6; // corner radius (px)

	const roundedRect = (x: number, y: number, w: number, h: number, radius: number) => {
		ctx.beginPath();
		ctx.moveTo(x + radius, y);
		ctx.arcTo(x + w, y, x + w, y + radius, radius);
		ctx.arcTo(x + w, y + h, x + w - radius, y + h, radius);
		ctx.arcTo(x, y + h, x, y + h - radius, radius);
		ctx.arcTo(x, y, x + radius, y, radius);
		ctx.closePath();
	};

	// White fill
	ctx.fillStyle = 'rgba(255, 255, 255, 0.97)';
	roundedRect(1, 1, W - 2, H - 2, r);
	ctx.fill();

	// Blue border
	ctx.strokeStyle = 'rgba(59, 130, 246, 0.75)';
	ctx.lineWidth = 1.5;
	roundedRect(1.5, 1.5, W - 3, H - 3, r - 0.5);
	ctx.stroke();

	return ctx.getImageData(0, 0, W, H);
}

// ─── Internal UI state ────────────────────────────────────────────────────────

interface TextInputState {
	x: number;
	y: number;
	longitude: number;
	latitude: number;
}

// ─── GeoJSON helper ────────────────────────────────────────────────────────────

function annotationsToGeoJSON(annotations: TextAnnotation[]): FeatureCollection {
	return {
		type: 'FeatureCollection',
		features: annotations.map((a) => ({
			type: 'Feature',
			geometry: { type: 'Point', coordinates: [a.longitude, a.latitude] },
			properties: {
				id: a.id,
				text: a.text,
				color: a.color,
				fontSize: a.fontSize,
			},
		})),
	};
}

// ─── Annotation style editor ──────────────────────────────────────────────────
//
// Defined at module level (not inside MlTextLayer) so React never treats it as
// a new component type on re-render, which would cause it to unmount/remount
// on every parent render cycle.

interface AnnotationStyleEditorProps {
	initialColor: string;
	initialFontSize: number;
	onApply: (color: string, fontSize: number) => void;
	onDelete: () => void;
}

const AnnotationStyleEditor = ({
	initialColor,
	initialFontSize,
	onApply,
	onDelete,
}: AnnotationStyleEditorProps) => {
	const [color, setColor] = useState(initialColor);
	const [fontSize, setFontSize] = useState(initialFontSize);

	return (
		<div style={{ display: 'flex', flexDirection: 'column', gap: 10 }}>
			{/* Header */}
			<span
				style={{
					fontSize: 11,
					fontWeight: 600,
					color: '#6b7280',
					letterSpacing: '0.05em',
					textTransform: 'uppercase',
				}}
			>
				Edit text style
			</span>

			{/* Colour picker */}
			<label
				style={{
					display: 'flex',
					alignItems: 'center',
					justifyContent: 'space-between',
					color: '#374151',
				}}
			>
				<span>Color</span>
				<input
					type="color"
					value={color}
					onChange={(e) => setColor(e.target.value)}
					style={{
						width: 34,
						height: 26,
						border: '1px solid #d1d5db',
						borderRadius: 4,
						cursor: 'pointer',
						padding: 0,
						background: 'none',
					}}
				/>
			</label>

			{/* Font size */}
			<label
				style={{
					display: 'flex',
					alignItems: 'center',
					justifyContent: 'space-between',
					gap: 8,
					color: '#374151',
				}}
			>
				<span>Size</span>
				<div style={{ display: 'flex', alignItems: 'center', gap: 6 }}>
					<input
						type="range"
						min={8}
						max={48}
						step={1}
						value={fontSize}
						onChange={(e) => setFontSize(Number(e.target.value))}
						style={{ width: 90, cursor: 'pointer' }}
					/>
					<span
						style={{
							minWidth: 26,
							textAlign: 'right',
							color: '#6b7280',
							fontVariantNumeric: 'tabular-nums',
						}}
					>
						{fontSize}
					</span>
				</div>
			</label>

			{/* Apply + Delete */}
			<div
				style={{
					display: 'flex',
					gap: 6,
					paddingTop: 6,
					borderTop: '1px solid #f3f4f6',
					marginTop: 2,
				}}
			>
				<button
					type="button"
					onClick={() => onApply(color, fontSize)}
					style={{
						flex: 1,
						padding: '6px 8px',
						background: '#3b82f6',
						color: '#fff',
						border: 'none',
						borderRadius: 5,
						cursor: 'pointer',
						fontSize: 12,
						fontWeight: 600,
					}}
				>
					Apply
				</button>
				<button
					type="button"
					onClick={onDelete}
					style={{
						flex: 1,
						padding: '6px 8px',
						background: '#fee2e2',
						color: '#b91c1c',
						border: '1px solid #fca5a5',
						borderRadius: 5,
						cursor: 'pointer',
						fontSize: 12,
						fontWeight: 600,
					}}
				>
					Delete
				</button>
			</div>
		</div>
	);
};

// ─── Component ────────────────────────────────────────────────────────────────

/**
 * `MlTextLayer` lets users annotate the map with text labels interactively.
 *
 * - **Right-click** anywhere on the map → context menu with "Add text".
 * - After typing, press **Enter** (or click **Add**) to place the label.
 * - **Right-click** on an existing label → inline style editor (color + size)
 *   with a **Delete** option.
 *
 * The context menu is powered by `useMapContextMenu`, making it easy to extend
 * with additional items (e.g. "Copy coordinates") at the consumer level.
 *
 * The component can be used uncontrolled (manages its own annotation list) or
 * controlled (pass `annotations` + `onAnnotationsChange`).
 *
 * Must be rendered inside a `<MapComponentsProvider>` tree that also contains
 * a `<MapLibreMap mapId="..." />`.
 *
 * @example
 * // Uncontrolled
 * <MlTextLayer mapId="map_1" defaultColor="#2563eb" defaultFontSize={14} />
 *
 * @example
 * // Controlled
 * <MlTextLayer
 *   mapId="map_1"
 *   annotations={annotations}
 *   onAnnotationsChange={setAnnotations}
 * />
 */
const MlTextLayer = (props: MlTextLayerProps) => {
	const {
		mapId,
		insertBeforeLayer,
		annotations: controlledAnnotations,
		onAnnotationsChange,
		defaultColor = '#111827',
		defaultFontSize = 14,
	} = props;

	const mapHook = useMap({ mapId, waitForLayer: insertBeforeLayer });

	// Stable IDs that survive re-renders
	const compId = useRef(`MlTextLayer-${crypto.randomUUID()}`);
	const sourceId = useRef(`${compId.current}-source`);
	const layerId = useRef(`${compId.current}-layer`);

	// ── Background sprite registration ───────────────────────────────────────
	// Registers the white panel sprite once the map is ready, and re-registers
	// it automatically whenever the map style reloads (styledata event).
	useEffect(() => {
		if (!mapHook.map) return;

		const addSprite = () => {
			if (mapHook.map?.map.hasImage(ANNOTATION_BG_SPRITE_ID)) return;
			try {
				const imageData = createAnnotationBgSprite();
				mapHook.map?.map.addImage(ANNOTATION_BG_SPRITE_ID, imageData, {
					// Stretch the centre 16 px horizontally and vertically;
					// keep the 8 px corners fixed so arcs stay sharp at any size.
					stretchX: [[8, 24]],
					stretchY: [[8, 24]],
					// The content box defines which part of the sprite maps to the
					// text bounding-box (before icon-text-fit-padding is applied).
					content: [4, 4, 28, 28],
				});
			} catch {
				// Silently swallow – will retry on the next styledata event.
			}
		};

		addSprite();
		// Re-add after style reloads (map.addImage results are cleared on style change)
		mapHook.map.on('styledata', addSprite);

		return () => {
			mapHook.map?.off('styledata', addSprite);
		};
	}, [mapHook.map]);

	// ── Annotation state (uncontrolled fallback) ───────────────────────────
	const [internalAnnotations, setInternalAnnotations] = useState<TextAnnotation[]>([]);
	const annotations = controlledAnnotations ?? internalAnnotations;

	const updateAnnotations = useCallback(
		(next: TextAnnotation[]) => {
			if (controlledAnnotations === undefined) setInternalAnnotations(next);
			onAnnotationsChange?.(next);
		},
		[controlledAnnotations, onAnnotationsChange]
	);

	// ── Text-input overlay state ───────────────────────────────────────────
	const [textInput, setTextInput] = useState<TextInputState | null>(null);
	const [inputValue, setInputValue] = useState('');

	// ── Context menu items ─────────────────────────────────────────────────
	//
	// `getItems` is re-created whenever its dependencies change, but that is
	// intentional – the hook calls it during render so closures are always fresh.
	const getItems = useCallback(
		({
			longitude,
			latitude,
			x,
			y,
			features,
			closeMenu,
		}: MapContextMenuClickContext): MapContextMenuItem[] => {
			// ── Empty map right-click → offer "Add text" ────────────────────
			if (features.length === 0) {
				return [
					{
						content: '✏️  Add text',
						onClick: () => {
							setTextInput({ x, y, longitude, latitude });
							setInputValue('');
						},
					},
				];
			}

			// ── Annotation right-click → style editor widget ─────────────
			const f = features[0];
			const annotationId: string = f.properties?.id;

			return [
				{
					// itemKey ensures AnnotationStyleEditor remounts when a different
					// annotation is right-clicked without closing the menu first.
					itemKey: annotationId,
					content: (
						<AnnotationStyleEditor
							initialColor={f.properties?.color ?? defaultColor}
							initialFontSize={f.properties?.fontSize ?? defaultFontSize}
							onApply={(color, fontSize) => {
								updateAnnotations(
									annotations.map((a) => (a.id === annotationId ? { ...a, color, fontSize } : a))
								);
								closeMenu();
							}}
							onDelete={() => {
								updateAnnotations(annotations.filter((a) => a.id !== annotationId));
								closeMenu();
							}}
						/>
					),
				},
			];
		},
		[defaultColor, defaultFontSize, annotations, updateAnnotations]
	);

	// ── Context menu hook ──────────────────────────────────────────────────
	const { menuNode, isOpen: menuIsOpen } = useMapContextMenu({
		mapId,
		queryLayers: [layerId.current],
		getItems,
	});

	// Close the text-input overlay when the context menu opens
	useEffect(() => {
		if (menuIsOpen) setTextInput(null);
	}, [menuIsOpen]);

	// ── Text input handlers ───────────────────────────────────────────────
	const handleConfirmText = useCallback(() => {
		if (!textInput || !inputValue.trim()) {
			setTextInput(null);
			return;
		}
		const newAnnotation: TextAnnotation = {
			id: crypto.randomUUID(),
			longitude: textInput.longitude,
			latitude: textInput.latitude,
			text: inputValue.trim(),
			color: defaultColor,
			fontSize: defaultFontSize,
		};
		updateAnnotations([...annotations, newAnnotation]);
		setTextInput(null);
		setInputValue('');
	}, [textInput, inputValue, defaultColor, defaultFontSize, annotations, updateAnnotations]);

	const handleTextKeyDown = useCallback(
		(e: ReactKeyboardEvent<HTMLTextAreaElement>) => {
			if (e.key === 'Enter' && !e.shiftKey) {
				e.preventDefault();
				handleConfirmText();
			}
			if (e.key === 'Escape') setTextInput(null);
		},
		[handleConfirmText]
	);

	// ── GeoJSON ────────────────────────────────────────────────────────────
	const geojson = useMemo(() => annotationsToGeoJSON(annotations), [annotations]);

	// ── Source ────────────────────────────────────────────────────────────
	useSource({
		mapId,
		sourceId: sourceId.current,
		source: {
			type: 'geojson',
			data: geojson as unknown as string,
		},
	});

	// ── Symbol layer ───────────────────────────────────────────────────────
	// color and fontSize are driven per-feature via data expressions.
	useLayer({
		mapId,
		layerId: layerId.current,
		insertBeforeLayer,
		options: {
			type: 'symbol',
			source: sourceId.current,
			layout: {
				// ── Background panel ──────────────────────────────────────────
				// The stretchable white-panel sprite stretches to enclose the text,
				// making annotations immediately distinguishable from map labels.
				'icon-image': ANNOTATION_BG_SPRITE_ID,
				'icon-text-fit': 'both' as any,
				// Extra breathing room: [top, right, bottom, left] in px
				'icon-text-fit-padding': [5, 10, 5, 10] as any,
				'icon-anchor': 'center',
				// Keep the background panel upright when the map is rotated
				'icon-rotation-alignment': 'viewport',
				'icon-allow-overlap': true,
				'icon-ignore-placement': true,
				// ── Text ─────────────────────────────────────────────────────
				'text-field': ['get', 'text'] as any,
				'text-font': ['Open Sans Bold', 'Open Sans Regular', 'Arial Unicode MS Bold'],
				// Per-feature font size driven by the 'fontSize' GeoJSON property
				'text-size': ['get', 'fontSize'] as any,
				'text-anchor': 'center',
				// Always upright regardless of map bearing
				'text-rotation-alignment': 'viewport',
				'text-allow-overlap': true,
				'text-ignore-placement': true,
			},
			paint: {
				// Per-feature colour driven by the 'color' GeoJSON property
				'text-color': ['get', 'color'] as any,
				// Minimal halo – the white background panel is the main contrast source
				'text-halo-color': 'rgba(255,255,255,0.6)',
				'text-halo-width': 1,
				'text-halo-blur': 0,
			},
		},
	});

	// ── UI Render ─────────────────────────────────────────────────────────
	return (
		<>
			{/* Context menu – powered by useMapContextMenu */}
			{menuNode}

			{/* Text input overlay */}
			{textInput && (
				<div
					style={{
						position: 'fixed',
						top: textInput.y,
						left: textInput.x,
						transform: 'translate(-50%, -50%)',
						background: '#ffffff',
						border: '2px solid #3b82f6',
						borderRadius: 10,
						boxShadow: '0 8px 32px rgba(59,130,246,0.18)',
						padding: '12px 14px',
						zIndex: 9999,
						minWidth: 250,
						display: 'flex',
						flexDirection: 'column',
						gap: 10,
						fontFamily: 'system-ui, -apple-system, BlinkMacSystemFont, "Segoe UI", sans-serif',
						fontSize: 13,
						lineHeight: 1.5,
						boxSizing: 'border-box',
					}}
					role="dialog"
					onClick={(e) => e.stopPropagation()}
					onKeyDown={(e) => e.stopPropagation()}
				>
					<div
						style={{
							fontSize: 11,
							fontWeight: 600,
							color: '#6b7280',
							letterSpacing: '0.05em',
							textTransform: 'uppercase',
						}}
					>
						Add text annotation
					</div>

					<textarea
						// biome-ignore lint/a11y/noAutofocus: intentional – immediately capture input
						autoFocus
						value={inputValue}
						onChange={(e) => setInputValue(e.target.value)}
						onKeyDown={handleTextKeyDown}
						placeholder="Type your text…"
						rows={2}
						style={{
							resize: 'none',
							border: '1px solid #d1d5db',
							borderRadius: 6,
							padding: '7px 9px',
							fontSize: 13,
							outline: 'none',
							width: '100%',
							boxSizing: 'border-box',
							fontFamily: 'inherit',
							lineHeight: 1.5,
							color: '#111827',
							transition: 'border-color 0.15s',
						}}
						onFocus={(e) => {
							e.currentTarget.style.borderColor = '#3b82f6';
						}}
						onBlur={(e) => {
							e.currentTarget.style.borderColor = '#d1d5db';
						}}
					/>

					<div style={{ display: 'flex', gap: 6, justifyContent: 'flex-end' }}>
						<button
							type="button"
							onClick={() => setTextInput(null)}
							style={{
								padding: '6px 14px',
								background: '#f9fafb',
								color: '#374151',
								border: '1px solid #d1d5db',
								borderRadius: 6,
								cursor: 'pointer',
								fontSize: 12,
								fontWeight: 500,
							}}
						>
							Cancel
						</button>
						<button
							type="button"
							onClick={handleConfirmText}
							style={{
								padding: '6px 14px',
								background: '#3b82f6',
								color: '#fff',
								border: 'none',
								borderRadius: 6,
								cursor: 'pointer',
								fontSize: 12,
								fontWeight: 600,
							}}
						>
							Add
						</button>
					</div>

					<div style={{ fontSize: 11, color: '#9ca3af' }}>
						Enter&nbsp;to confirm&nbsp;·&nbsp;Shift+Enter for new line&nbsp;·&nbsp;Esc to cancel
					</div>
				</div>
			)}
		</>
	);
};

export default MlTextLayer;
