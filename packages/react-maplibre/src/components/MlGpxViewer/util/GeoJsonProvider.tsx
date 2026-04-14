import type { FeatureCollection } from 'geojson';
import type React from 'react';
import { useState } from 'react';
import { GeoJsonContextProvider } from './GeoJsonContext';

interface geoJsonProviderValue {
	data: FeatureCollection;
	setData: (data: FeatureCollection) => void;
	getEmptyFeatureCollection: () => FeatureCollection;
}

const GeoJsonProvider = ({ children }: { children: React.JSX.Element }) => {
	const [data, setData] = useState<FeatureCollection>({
		type: 'FeatureCollection',
		features: [],
	});
	const getEmptyFeatureCollection: () => FeatureCollection = () => {
		return {
			type: 'FeatureCollection',
			features: [],
		};
	};
	const value: geoJsonProviderValue = {
		data,
		setData,
		getEmptyFeatureCollection,
	};

	return <GeoJsonContextProvider value={value}>{children}</GeoJsonContextProvider>;
};

export default GeoJsonProvider;
