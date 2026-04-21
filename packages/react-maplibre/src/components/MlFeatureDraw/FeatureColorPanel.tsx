import CloseIcon from '@mui/icons-material/Close';
import Box from '@mui/material/Box';
import Divider from '@mui/material/Divider';
import IconButton from '@mui/material/IconButton';
import Paper from '@mui/material/Paper';
import Typography from '@mui/material/Typography';
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
		<Paper
			elevation={4}
			sx={{
				position: 'absolute',
				right: 16,
				top: '50%',
				transform: 'translateY(-50%)',
				zIndex: 1000,
				width: 240,
				p: 2,
				pointerEvents: 'all',
			}}
		>
			{/* Header */}
			<Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', mb: 1 }}>
				<Typography variant="subtitle2" fontWeight="bold">
					{geometryType}
				</Typography>
				<IconButton size="small" onClick={onClose} aria-label="close color panel">
					<CloseIcon fontSize="small" />
				</IconButton>
			</Box>

			<Divider sx={{ mb: 2 }} />

			{/* Fill color — polygon and point */}
			{(isPolygon || isPoint) && (
				<Box sx={{ mb: 2 }}>
					<Typography variant="caption" color="text.secondary" display="block" mb={0.5}>
						Fill Color
					</Typography>
					<ColorPicker
						value={fillColor}
						convert="hex"
						onChange={(color) => onFillColorChange(id, color)}
					/>
				</Box>
			)}

			{/* Outline / line color — polygon and linestring */}
			{(isPolygon || isLine) && (
				<Box>
					<Typography variant="caption" color="text.secondary" display="block" mb={0.5}>
						{isPolygon ? 'Outline Color' : 'Line Color'}
					</Typography>
					<ColorPicker
						value={outlineColor}
						convert="hex"
						onChange={(color) => onOutlineColorChange(id, color)}
					/>
				</Box>
			)}
		</Paper>
	);
}
