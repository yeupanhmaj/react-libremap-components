import WallpaperIcon from '@mui/icons-material/Wallpaper';
import { Button, type SxProps } from '@mui/material';
import type { StyleSpecification } from 'maplibre-gl';
import React from 'react';
import LayerContext from '../../contexts/LayerContext';
import GruvboxStyle from '../../omt_styles/gruvbox';
import MedievalKingdomStyle from '../../omt_styles/medieval_kingdom';
import MonokaiStyle from '../../omt_styles/monokai';
import OceanicNextStyle from '../../omt_styles/oceanic_next';
import SolarizedStyle from '../../omt_styles/solarized';
import SelectStylePopup from './SelectStylePopup';

export interface SelectStyleButtonProps {
	sx?: SxProps;
	onComplete?: (config: StyleSpecification[]) => void;
	styles?: StyleSpecification[];
	defaultStyles?: boolean;
	styleThumbnailPaths?: { [key: string]: string };
}

const defaultStyleThumbnailPath =
	'https://mapcomponents.github.io/react-map-components-maplibre/assets/style_thumbnails/';

const SelectStyleButton = ({
	sx,
	styles = [],
	defaultStyles = true,
	styleThumbnailPaths,
}: SelectStyleButtonProps) => {
	const layerContext = React.useContext(LayerContext);
	const [popupOpen, setPopupOpen] = React.useState<boolean>(false);

	return (
		<>
			<Button
				variant="contained"
				sx={{ marginTop: '10px', ...sx }}
				onClick={() => setPopupOpen(true)}
			>
				<WallpaperIcon />
			</Button>
			<SelectStylePopup
				styles={
					[
						...(defaultStyles
							? [MonokaiStyle, SolarizedStyle, OceanicNextStyle, MedievalKingdomStyle, GruvboxStyle]
							: []),
						...(styles || []),
					] as StyleSpecification[]
				}
				styleThumbnailPaths={{
					...styleThumbnailPaths,
					...(defaultStyles
						? {
								Monokai: defaultStyleThumbnailPath + 'monokai.png',
								Gruvbox: defaultStyleThumbnailPath + 'gruvbox.png',
								'Oceanic Next': defaultStyleThumbnailPath + 'oceanic_next.png',
								Solarized: defaultStyleThumbnailPath + 'solarized.png',
								'Medieval Kingdom': defaultStyleThumbnailPath + 'medieval_kingdom.png',
							}
						: {}),
				}}
				open={popupOpen}
				setOpen={setPopupOpen}
				onSelect={(style) => {
					// Todo: should be possible without clearing bg layers first & setTimeout
					layerContext.setBackgroundLayers([]);
					setTimeout(() => {
						layerContext.updateStyle(style);
					}, 100);
					setPopupOpen(false);
				}}
			/>
		</>
	);
};

export default SelectStyleButton;
