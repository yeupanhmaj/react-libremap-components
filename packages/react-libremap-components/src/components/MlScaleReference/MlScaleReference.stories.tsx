import { useEffect, useState } from 'react';
import mapContextDecorator from '../../decorators/MapContextDecorator';
import MlScaleReference, { type MlScaleReferenceProps } from './MlScaleReference';

// Custom lightweight media query hook
const useMediaQuery = (query: string) => {
	const [matches, setMatches] = useState(false);

	useEffect(() => {
		const media = window.matchMedia(query);
		if (media.matches !== matches) {
			setMatches(media.matches);
		}
		const listener = () => setMatches(media.matches);
		media.addEventListener('change', listener);
		return () => media.removeEventListener('change', listener);
	}, [matches, query]);

	return matches;
};

const storyoptions = {
	title: 'MapComponents/MlScaleReference',
	component: MlScaleReference,
	argTypes: {
		url: {},
		layer: {},
	},
	decorators: mapContextDecorator,
};
export default storyoptions;

const catalgoueTemplate: any = (props: MlScaleReferenceProps) => {
	const [showTooltip, setShowTooltip] = useState(true);
	const mediaIsMobile = useMediaQuery('(max-width: 900px)');

	useEffect(() => {
		const timeout = setTimeout(() => {
			setShowTooltip(false);
		}, 7000);
		return () => clearTimeout(timeout);
	}, []);

	return (
		<>
			{showTooltip && (
				<div
					style={{
						position: 'fixed',
						right: mediaIsMobile ? '105px' : '175px',
						color: '#009ee0',
						backgroundColor: '#fff',
						top: mediaIsMobile ? '20px' : '22px',
						fontSize: '16px',
						fontFamily: 'sans-serif',
						display: 'flex',
						flexDirection: 'column',
						gap: '5px',
						zIndex: 5000,
					}}
				>
					{mediaIsMobile
						? 'Use Zoom to view functionality ➤'
						: 'Use Zoom to explore functionality ➤'}
				</div>
			)}
		</>
	);
};

const OverlayTemplate: any = (props: MlScaleReferenceProps) => {
	const mediaIsMobile = useMediaQuery('(max-width: 900px)');

	return (
		<div
			style={{
				position: 'absolute',
				zIndex: 1000,
				bottom: mediaIsMobile ? '38px' : '8px',
				left: '10px',
			}}
		>
			<MlScaleReference {...props} />
		</div>
	);
};

export const Overlay = OverlayTemplate.bind({});
Overlay.args = {};

export const CatalogueDemo = catalgoueTemplate.bind({});
CatalogueDemo.args = {};
