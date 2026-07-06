import { useMap } from 'react-libremap-components';
import { useEffect, useState } from 'react';
import MlThreeJsContextDecorator from '../../decorators/ThreejsContextDecorator';
import { MlThreeObjectControls } from '../MlThreeObjectControls';
import MlThreeSplatLayer from './MlThreeSplatLayer';

// Local lightweight UI components to replace missing component library exports
const TopToolbar = ({ unmovableButtons }: { unmovableButtons: React.ReactNode }) => (
	<div style={{ position: 'absolute', top: '10px', left: '10px', zIndex: 1000, display: 'flex', gap: '10px' }}>
		{unmovableButtons}
	</div>
);

const Sidebar = ({ open, setOpen, name, children }: { open: boolean; setOpen: (open: boolean) => void; name: string; children: React.ReactNode }) => {
	if (!open) return null;
	return (
		<div style={{
			position: 'absolute',
			top: '60px',
			left: '10px',
			zIndex: 1000,
			width: '320px',
			maxHeight: 'calc(100vh - 80px)',
			overflowY: 'auto',
			backgroundColor: '#fff',
			boxShadow: '0 4px 12px rgba(0,0,0,0.15)',
			borderRadius: '8px',
			padding: '16px',
			fontFamily: 'sans-serif'
		}}>
			<div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '12px' }}>
				<h3 style={{ margin: 0, fontSize: '1.1rem' }}>{name}</h3>
				<button type="button" onClick={() => setOpen(false)} style={{ border: 'none', background: 'none', cursor: 'pointer', fontSize: '1.2rem', fontWeight: 'bold' }}>✕</button>
			</div>
			{children}
		</div>
	);
};

const storyoptions = {
	title: 'MapComponents/MlThreeSplatLayer',
	component: MlThreeSplatLayer,
	argTypes: {
		options: {
			control: {
				type: 'object',
			},
		},
	},
	decorators: MlThreeJsContextDecorator,
};
export default storyoptions;

const Template: any = () => {
	const [showLayer, setShowLayer] = useState(true);
	const [scale, setScale] = useState(100);
	const [rotation, setRotation] = useState({ x: 270, y: 0, z: 5 });
	const [mapPosition, setMapPosition] = useState({ lng: 7.0968, lat: 50.736 });
	const [position, setPosition] = useState({ x: 0, y: 0, z: 30 });
	const [sidebarOpen, setSidebarOpen] = useState(true);
	const [enableTransformControls, setEnableTransformControls] = useState(false);
	const [transformMode, setTransformMode] = useState<'translate' | 'rotate' | 'scale'>('translate');

	const mapHook = useMap({ mapId: 'map_1' });
	useEffect(() => {
		if (!mapHook.map) return;
		mapHook.map?.setZoom(17.5);
		mapHook.map?.setPitch(44.5);
		mapHook.map?.setCenter([7.096614581535903, 50.736500960686556]);
	}, [mapHook.map]);

	return (
		<>
			{showLayer && (
				<MlThreeSplatLayer
					url="assets/splats/output.splat"
					position={[mapPosition.lng, mapPosition.lat]}
					transform={{
						rotation: {
							x: (rotation.x * Math.PI) / 180,
							y: (rotation.y * Math.PI) / 180,
							z: (rotation.z * Math.PI) / 180,
						},
						scale: scale,
						position: position,
					}}
				/>
			)}
			<TopToolbar
				unmovableButtons={
					<button
						type="button"
						style={{
							padding: '6px 16px',
							backgroundColor: sidebarOpen ? '#1976d2' : 'transparent',
							color: sidebarOpen ? '#fff' : '#1976d2',
							border: '1px solid #1976d2',
							borderRadius: '4px',
							cursor: 'pointer',
							fontFamily: 'inherit',
							fontSize: '0.875rem',
							fontWeight: 500,
						}}
						onClick={() => setSidebarOpen(!sidebarOpen)}
					>
						Sidebar
					</button>
				}
			/>
			<Sidebar open={sidebarOpen} setOpen={setSidebarOpen} name="Splat Config">
				<MlThreeObjectControls
					showLayer={showLayer}
					setShowLayer={setShowLayer}
					scale={scale}
					setScale={setScale}
					rotation={rotation}
					setRotation={setRotation}
					mapPosition={mapPosition}
					setMapPosition={setMapPosition}
					position={position}
					setPosition={setPosition}
					layerName="Splat"
					enableTransformControls={enableTransformControls}
					setEnableTransformControls={setEnableTransformControls}
					transformMode={transformMode}
					setTransformMode={setTransformMode}
				/>
				<div
					style={{
						marginTop: '16px',
						padding: '8px',
						backgroundColor: 'rgba(0,0,0,0.05)',
						borderRadius: '4px',
						fontSize: '0.875rem',
						lineHeight: '1.4',
					}}
				>
					The splat used is from{' '}
					<a
						href="https://www.patreon.com/posts/cluster-fly-141866089"
						target="_blank"
						rel="noopener"
						style={{ color: '#1976d2', textDecoration: 'none' }}
					>
						Cluster Fly
					</a>{' '}
					by Dany Bittel published under CC.
				</div>
			</Sidebar>
		</>
	);
};

export const Default = Template.bind({});
Default.parameters = {};
