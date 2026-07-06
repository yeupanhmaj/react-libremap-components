import { uuid_regex } from '../../setupTests';
import { layerRemovalTest, sourceRemovalTest } from '../../util';
import MlWmsLayer from './MlWmsLayer';

const testComponent = <MlWmsLayer url="mock" urlParameters={{ layers: 'mock' }} />;

layerRemovalTest(
	'<MlWmsLayer />',
	testComponent,
	new RegExp('^.*"MlWmsLayer-' + uuid_regex + '".*$'),
	'MlWmsLayer-{uuid}'
);
sourceRemovalTest(
	'<MlWmsLayer />',
	testComponent,
	new RegExp('^.*"MlWmsLayer-' + uuid_regex + '".*$'),
	'MlWmsLayer-{uuid}'
);
