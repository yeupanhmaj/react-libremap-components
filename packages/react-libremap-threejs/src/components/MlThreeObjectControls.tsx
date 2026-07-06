import type { LngLatLike } from 'maplibre-gl';
import { useLayoutEffect, useRef, useState } from 'react';
import * as THREE from 'three';
import { useThree } from '../contexts/ThreeContext';
import ThreejsUtils from '../lib/ThreejsUtils';
import MlThreeGizmo from './MlThreeGizmo';

export interface ThreeObjectControlsProps {
	showLayer: boolean;
	setShowLayer: (show: boolean) => void;
	scale: number;
	setScale: (scale: number) => void;
	rotation: { x: number; y: number; z: number };
	setRotation: (rotation: { x: number; y: number; z: number }) => void;
	mapPosition: { lng: number; lat: number };
	setMapPosition: (position: { lng: number; lat: number }) => void;
	position: { x: number; y: number; z: number };
	setPosition: (position: { x: number; y: number; z: number }) => void;
	enableTransformControls?: boolean;
	setEnableTransformControls?: (enable: boolean) => void;
	transformMode?: 'translate' | 'rotate' | 'scale';
	setTransformMode?: (mode: 'translate' | 'rotate' | 'scale') => void;
	layerName?: string;
}

export const MlThreeObjectControls = ({
	showLayer,
	setShowLayer,
	scale,
	setScale,
	rotation,
	setRotation,
	mapPosition,
	setMapPosition,
	position,
	setPosition,
	enableTransformControls,
	setEnableTransformControls,
	transformMode,
	setTransformMode,
	layerName = 'Layer',
}: ThreeObjectControlsProps) => {
	const { scene, worldMatrixInv } = useThree();
	const dummyMeshRef = useRef<THREE.Mesh | undefined>(undefined);
	const [dummyMeshReady, setDummyMeshReady] = useState(false);

	// Create and manage dummy mesh for transform controls
	useLayoutEffect(() => {
		if (!scene || !worldMatrixInv || !enableTransformControls) {
			// Clean up dummy mesh when controls are disabled
			if (dummyMeshRef.current) {
				scene?.remove(dummyMeshRef.current);
				dummyMeshRef.current.geometry.dispose();
				(dummyMeshRef.current.material as THREE.Material).dispose();
				dummyMeshRef.current = undefined;
				setDummyMeshReady(false);
			}
			return;
		}

		// Create invisible dummy mesh at the model position
		const geometry = new THREE.BoxGeometry(1, 1, 1);
		const material = new THREE.MeshBasicMaterial({ visible: false });
		const dummyMesh = new THREE.Mesh(geometry, material);

		// Position the dummy mesh
		const scenePos = ThreejsUtils.toScenePosition(
			worldMatrixInv,
			[mapPosition.lng, mapPosition.lat] as LngLatLike,
			0
		);
		dummyMesh.position.set(
			scenePos.x + position.x,
			scenePos.y + position.y,
			scenePos.z + position.z
		);
		dummyMesh.rotation.set(
			(rotation.x * Math.PI) / 180,
			(rotation.y * Math.PI) / 180,
			(rotation.z * Math.PI) / 180
		);
		dummyMesh.scale.set(scale, scale, scale);

		scene.add(dummyMesh);
		dummyMeshRef.current = dummyMesh;
		setDummyMeshReady(true);

		return () => {
			if (dummyMeshRef.current) {
				scene.remove(dummyMeshRef.current);
				dummyMeshRef.current.geometry.dispose();
				(dummyMeshRef.current.material as THREE.Material).dispose();
				dummyMeshRef.current = undefined;
				setDummyMeshReady(false);
			}
		};
	}, [scene, worldMatrixInv, enableTransformControls]);

	// Update dummy mesh position when props change (but only when controls are enabled)
	useLayoutEffect(() => {
		if (!dummyMeshRef.current || !worldMatrixInv) return;

		const scenePos = ThreejsUtils.toScenePosition(
			worldMatrixInv,
			[mapPosition.lng, mapPosition.lat] as LngLatLike,
			0
		);
		dummyMeshRef.current.position.set(
			scenePos.x + position.x,
			scenePos.y + position.y,
			scenePos.z + position.z
		);
		dummyMeshRef.current.rotation.set(
			(rotation.x * Math.PI) / 180,
			(rotation.y * Math.PI) / 180,
			(rotation.z * Math.PI) / 180
		);
		dummyMeshRef.current.scale.set(scale, scale, scale);
		dummyMeshRef.current.updateMatrixWorld(true);
	}, [position, rotation, scale, mapPosition, worldMatrixInv]);

	const handleObjectChange = (object: THREE.Object3D) => {
		if (!worldMatrixInv) return;

		// Get the base scene position from map coordinates
		const scenePos = ThreejsUtils.toScenePosition(
			worldMatrixInv,
			[mapPosition.lng, mapPosition.lat] as LngLatLike,
			0
		);

		// Calculate the offset position (object position - base scene position)
		setPosition({
			x: object.position.x - scenePos.x,
			y: object.position.y - scenePos.y,
			z: object.position.z - scenePos.z,
		});

		// Update rotation (convert from radians to degrees)
		setRotation({
			x: (object.rotation.x * 180) / Math.PI,
			y: (object.rotation.y * 180) / Math.PI,
			z: (object.rotation.z * 180) / Math.PI,
		});

		// Update scale (assuming uniform scale)
		setScale(object.scale.x);
	};

	const buttonStyle = (active: boolean) => ({
		padding: '6px 12px',
		border: '1px solid #1976d2',
		backgroundColor: active ? '#1976d2' : 'transparent',
		color: active ? '#fff' : '#1976d2',
		cursor: 'pointer',
		fontFamily: 'inherit',
		fontSize: '0.875rem',
		fontWeight: 500,
		borderRadius: '4px',
	});

	const typographyStyle = {
		margin: '8px 0 4px 0',
		fontSize: '0.875rem',
		fontWeight: 'bold',
		fontFamily: 'sans-serif',
	};

	const sliderStyle = {
		width: '100%',
		marginBottom: '12px',
		accentColor: '#1976d2',
	};

	return (
		<>
			{dummyMeshReady && dummyMeshRef.current && enableTransformControls && (
				<MlThreeGizmo
					target={dummyMeshRef.current}
					mode={transformMode || 'translate'}
					enabled={enableTransformControls}
					onObjectChange={handleObjectChange}
				/>
			)}
			<div style={{ padding: '10px', fontFamily: 'sans-serif' }}>
				<div style={{ display: 'flex', gap: '8px', flexWrap: 'wrap', marginBottom: '16px' }}>
					<button
						type="button"
						style={buttonStyle(showLayer)}
						onClick={() => setShowLayer(!showLayer)}
					>
						{showLayer ? 'Hide' : 'Show'} {layerName}
					</button>
					{setEnableTransformControls && (
						<button
							type="button"
							style={buttonStyle(!!enableTransformControls)}
							onClick={() => setEnableTransformControls(!enableTransformControls)}
						>
							3D Gizmo
						</button>
					)}
				</div>

				{setTransformMode && enableTransformControls && (
					<div style={{ marginBottom: '16px' }}>
						<div style={{ display: 'flex', width: '100%' }}>
							<button
								type="button"
								style={{
									...buttonStyle(transformMode === 'translate'),
									flex: 1,
									borderTopRightRadius: 0,
									borderBottomRightRadius: 0,
								}}
								onClick={() => setTransformMode('translate')}
							>
								Move
							</button>
							<button
								type="button"
								style={{
									...buttonStyle(transformMode === 'rotate'),
									flex: 1,
									borderRadius: 0,
									borderLeft: 'none',
									borderRight: 'none',
								}}
								onClick={() => setTransformMode('rotate')}
							>
								Rotate
							</button>
							<button
								type="button"
								style={{
									...buttonStyle(transformMode === 'scale'),
									flex: 1,
									borderTopLeftRadius: 0,
									borderBottomLeftRadius: 0,
								}}
								onClick={() => setTransformMode('scale')}
							>
								Scale
							</button>
						</div>
					</div>
				)}
				<div style={typographyStyle}>Scale: {scale.toFixed(2)}</div>
				<input
					type="range"
					value={scale}
					onChange={(e) => setScale(Number.parseFloat(e.target.value))}
					min={0.01}
					max={150}
					step={0.01}
					style={sliderStyle}
				/>
				<div style={typographyStyle}>Rotation X: {rotation.x}°</div>
				<input
					type="range"
					value={rotation.x}
					onChange={(e) => setRotation({ ...rotation, x: Number.parseInt(e.target.value) })}
					min={0}
					max={360}
					style={sliderStyle}
				/>
				<div style={typographyStyle}>Rotation Y: {rotation.y}°</div>
				<input
					type="range"
					value={rotation.y}
					onChange={(e) => setRotation({ ...rotation, y: Number.parseInt(e.target.value) })}
					min={0}
					max={360}
					style={sliderStyle}
				/>
				<div style={typographyStyle}>Rotation Z: {rotation.z}°</div>
				<input
					type="range"
					value={rotation.z}
					onChange={(e) => setRotation({ ...rotation, z: Number.parseInt(e.target.value) })}
					min={0}
					max={360}
					style={sliderStyle}
				/>
				<div style={typographyStyle}>Longitude: {mapPosition.lng.toFixed(6)}</div>
				<input
					type="range"
					value={mapPosition.lng}
					onChange={(e) => setMapPosition({ ...mapPosition, lng: Number.parseFloat(e.target.value) })}
					min={7.09}
					max={7.11}
					step={0.0001}
					style={sliderStyle}
				/>
				<div style={typographyStyle}>Latitude: {mapPosition.lat.toFixed(6)}</div>
				<input
					type="range"
					value={mapPosition.lat}
					onChange={(e) => setMapPosition({ ...mapPosition, lat: Number.parseFloat(e.target.value) })}
					min={50.73}
					max={50.74}
					step={0.0001}
					style={sliderStyle}
				/>
				<div style={typographyStyle}>Position X: {position.x}</div>
				<input
					type="range"
					value={position.x}
					onChange={(e) => setPosition({ ...position, x: Number.parseInt(e.target.value) })}
					min={-100}
					max={100}
					style={sliderStyle}
				/>
				<div style={typographyStyle}>Position Y: {position.y}</div>
				<input
					type="range"
					value={position.y}
					onChange={(e) => setPosition({ ...position, y: Number.parseInt(e.target.value) })}
					min={-100}
					max={100}
					style={sliderStyle}
				/>
				<div style={typographyStyle}>Position Z: {position.z}</div>
				<input
					type="range"
					value={position.z}
					onChange={(e) => setPosition({ ...position, z: Number.parseInt(e.target.value) })}
					min={-500}
					max={100}
					style={sliderStyle}
				/>
			</div>
		</>
	);
};
