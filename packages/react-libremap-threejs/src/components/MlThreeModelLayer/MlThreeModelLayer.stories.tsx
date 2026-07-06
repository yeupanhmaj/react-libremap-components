import { useMap } from 'react-libremap-components';
import { useEffect, useRef, useState } from 'react';
import * as THREE from 'three';
import { useThree } from '../../contexts/ThreeContext';
import ThreejsContextDecorator from '../../decorators/ThreejsContextDecorator';
import { MlThreeObjectControls } from '../MlThreeObjectControls';
import MlThreeModelLayer from './MlThreeModelLayer';

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
	title: 'MapComponents/MlThreeModelLayer',
	component: MlThreeModelLayer,
	argTypes: {
		options: {
			control: {
				type: 'object',
			},
		},
	},
	decorators: ThreejsContextDecorator,
};
export default storyoptions;

const Lights = () => {
	const { scene } = useThree();
	const lightsRef = useRef<THREE.Light[]>([]);

	useEffect(() => {
		if (!scene) return;

		const directionalLight = new THREE.DirectionalLight(0xffffff);
		directionalLight.position.set(0, -70, 100).normalize();
		scene.add(directionalLight);

		const directionalLight2 = new THREE.DirectionalLight(0xff2255);
		directionalLight2.position.set(0, 70, 100).normalize();
		scene.add(directionalLight2);

		lightsRef.current = [directionalLight, directionalLight2];

		return () => {
			lightsRef.current.forEach((light) => scene.remove(light));
		};
	}, [scene]);

	return null;
};

const Template: any = () => {
	const [showLayer, setShowLayer] = useState(true);
	const [scale, setScale] = useState(1);
	const [rotation, setRotation] = useState({ x: 90, y: 90, z: 0 });
	const [mapPosition, setMapPosition] = useState({ lng: 7.097, lat: 50.7355 });
	const [position, setPosition] = useState({ x: 0, y: 0, z: 0 });
	const [sidebarOpen, setSidebarOpen] = useState(true);
	const [enableTransformControls, setEnableTransformControls] = useState(false);
	const [transformMode, setTransformMode] = useState<'translate' | 'rotate' | 'scale'>('translate');

	const mapHook = useMap({ mapId: 'map_1' });
	useEffect(() => {
		if (!mapHook.map) return;
		mapHook.map?.setZoom(15.5);
		mapHook.map?.setPitch(44.5);
		mapHook.map?.setCenter([7.097, 50.7355]);
	}, [mapHook.map]);

	return (
		<>
			<Lights />
			{showLayer && (
				<MlThreeModelLayer
					url="assets/3D/godzilla_simple.glb"
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
			<Sidebar open={sidebarOpen} setOpen={setSidebarOpen} name="3D Model Config">
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
					layerName="Model"
					enableTransformControls={enableTransformControls}
					setEnableTransformControls={setEnableTransformControls}
					transformMode={transformMode}
					setTransformMode={setTransformMode}
				/>
			</Sidebar>
		</>
	);
};

export const ExampleConfig = Template.bind({});
ExampleConfig.parameters = {};
