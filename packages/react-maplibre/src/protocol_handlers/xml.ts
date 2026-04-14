import * as externParser from '@tmcw/togeojson';
import type { FeatureCollection } from 'geojson';
import type { RequestParameters } from 'maplibre-gl';
import toGeoJSON from '../hooks/useGpx/lib/gpxConverter';
import getProtocolData from './utils/getProtocolData';
import protocolPathParser from './utils/protocolPathParser';

async function convertXML(params: {
	filename: string;
	protocolId: string;
}): Promise<FeatureCollection> {
	const geojson = await new Promise<FeatureCollection>((resolve, reject) => {
		getProtocolData(params.filename).then((rawData) => {
			const newData = () => {
				// use an extern converter for tcx files

				if (params.protocolId === 'tcx') {
					return externParser[params.protocolId](
						new DOMParser().parseFromString(rawData, 'text/xml')
					) as FeatureCollection;

					// use the projects gpxConverter function for gpx and kml files
				} else {
					return (toGeoJSON as { [key: string]: any })[params.protocolId](
						new DOMParser().parseFromString(rawData, 'text/xml')
					) as FeatureCollection;
				}
			};

			if (!newData()) {
				reject('Conversion failed');
			} else {
				resolve(newData());
			}
		});
	});

	return geojson;
}

const XMLProtocolHandler = async (params: RequestParameters) => {
	const parsedParams = protocolPathParser(params.url);

	const data = await convertXML(parsedParams);
	if (data !== undefined) {
		return { data: data };
	}
	throw new Error('XML not found ' + parsedParams.filename);
};

export { convertXML, XMLProtocolHandler };
