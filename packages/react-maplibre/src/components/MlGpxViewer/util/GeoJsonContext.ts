import type { FeatureCollection } from 'geojson';
import React from 'react';

type ContextProps = {
	data: FeatureCollection;
	setData: (data: FeatureCollection) => void;
	getEmptyFeatureCollection: () => FeatureCollection;
};

const GeoJsonContext = React.createContext<Partial<ContextProps>>({});

export const GeoJsonContextProvider = GeoJsonContext.Provider;
export default GeoJsonContext;
