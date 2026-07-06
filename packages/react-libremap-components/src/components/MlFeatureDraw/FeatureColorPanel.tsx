import type { GeoJSONStoreFeatures, TerraDrawExtend } from 'terra-draw';
import {
	DEFAULT_FILL_COLOR,
	DEFAULT_OUTLINE_COLOR,
} from '../../hooks/useFeatureDraw/useFeatureDraw';
import ColorPicker from '../../ui_components/ColorPicker/ColorPicker';

export interface FeatureColorPanelProps {
	/** The currently selected Terra Draw feature */
	feature: GeoJSONStoreFeatures;
	/** Called when the user changes the fill color (polygon / point) */
	onFillColorChange: (id: TerraDrawExtend.FeatureId, color: string) => void;
	/** Called when the user changes the outline / line color */
	onOutlineColorChange: (id: TerraDrawExtend.FeatureId, color: string) => void;
	/** Called when the user closes the panel */
	onClose: () => void;
}

/**
 * A right-side overlay panel that lets the user edit the colors of the
 * currently selected Terra Draw feature.
 *
 * - Polygon  → fill color + outline color
 * - LineString → line color only
 * - Point    → fill color only
 */
export default function FeatureColorPanel({
	feature,
	onFillColorChange,
	onOutlineColorChange,
	onClose,
}: FeatureColorPanelProps) {
	const geometryType = feature.geometry.type;
	const fillColor = (feature.properties?.fillColor as string) || DEFAULT_FILL_COLOR;
	const outlineColor = (feature.properties?.outlineColor as string) || DEFAULT_OUTLINE_COLOR;

	const isPolygon = geometryType === 'Polygon';
	const isLine = geometryType === 'LineString';
	const isPoint = geometryType === 'Point';

	const id = feature.id as TerraDrawExtend.FeatureId;

	return (
		<div
			style={{
				position: 'absolute',
				right: '16px',
				top: '50%',
				transform: 'translateY(-50%)',
				zIndex: 1000,
				width: '240px',
				padding: '16px',
				pointerEvents: 'all',
				backgroundColor: '#fff',
				borderRadius: '4px',
				boxShadow: '0px 2px 4px -1px rgba(0,0,0,0.2), 0px 4px 5px 0px rgba(0,0,0,0.14), 0px 1px 10px 0px rgba(0,0,0,0.12)', // elevation 4 equivalent
				fontFamily: 'sans-serif',
			}}
		>
			{/* Header */}
			<div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '8px' }}>
				<span style={{ fontSize: '0.875rem', fontWeight: 'bold' }}>
					{geometryType}
				</span>
				<button
					type="button"
					onClick={onClose}
					aria-label="close color panel"
					style={{
						padding: '4px',
						background: 'none',
						border: 'none',
						cursor: 'pointer',
						display: 'inline-flex',
						alignItems: 'center',
						justifyContent: 'center',
						color: 'inherit',
						borderRadius: '50%',
					}}
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
				</button>
			</div>

			<hr style={{ margin: '0 0 16px 0', border: 0, borderBottom: '1px solid rgba(0, 0, 0, 0.12)' }} />

			{/* Fill color — polygon and point */}
			{(isPolygon || isPoint) && (
				<div style={{ marginBottom: '16px' }}>
					<span style={{ display: 'block', fontSize: '0.75rem', color: 'rgba(0, 0, 0, 0.6)', marginBottom: '4px' }}>
						Fill Color
					</span>
					<ColorPicker
						value={fillColor}
						convert="hex"
						onChange={(color) => onFillColorChange(id, color)}
					/>
				</div>
			)}

			{/* Outline / line color — polygon and linestring */}
			{(isPolygon || isLine) && (
				<div>
					<span style={{ display: 'block', fontSize: '0.75rem', color: 'rgba(0, 0, 0, 0.6)', marginBottom: '4px' }}>
						{isPolygon ? 'Outline Color' : 'Line Color'}
					</span>
					<ColorPicker
						value={outlineColor}
						convert="hex"
						onChange={(color) => onOutlineColorChange(id, color)}
					/>
				</div>
			)}
		</div>
	);
}
