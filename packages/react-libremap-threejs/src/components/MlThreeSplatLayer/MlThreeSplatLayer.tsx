import { useMemo } from 'react';
import {
	type ModelLoader,
	type UseThreeModelProps,
	useThreeModel,
} from '../../hooks/useThreeModel';
import { PlySplatLoader } from '../../lib/splats/loaders/PlySplatLoader';
import { SplatLoader } from '../../lib/splats/loaders/SplatLoader';

/**
 * Renders splat 3D Models on the MapLibreMap
 *
 * @component
 */

export type MlThreeSplatLayerProps = Omit<UseThreeModelProps, 'loaders'> & {
	mapId?: string;
};

const MlThreeSplatLayer = (props: MlThreeSplatLayerProps) => {
	const { url, position, transform, init, onDone, customLoaders } = props;

	const loaders = useMemo<Record<string, ModelLoader>>(
		() => ({
			splat: (url, onLoad) => {
				const loader = new SplatLoader();
				loader.load(url, (splatMesh) => onLoad(splatMesh));
			},
			ply: (url, onLoad) => {
				const loader = new PlySplatLoader();
				loader.load(url, (splatMesh) => onLoad(splatMesh));
			},
		}),
		[]
	);

	useThreeModel({
		url,
		position,
		transform,
		init,
		onDone,
		loaders,
		customLoaders,
	});

	return null;
};

export default MlThreeSplatLayer;
