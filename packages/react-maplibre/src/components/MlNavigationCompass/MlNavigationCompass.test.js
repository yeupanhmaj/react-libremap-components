import { render, screen, waitFor } from '@testing-library/react';
import userEvent from '@testing-library/user-event';
import React, { useState } from 'react';
import { MapComponentsProvider } from '../../contexts/MapContext';
import { mockMapLibreMethods } from '../../setupTests';
import MapLibreMap from './../MapLibreMap/MapLibreMap';
import MlNavigationCompass from './MlNavigationCompass';

jest.mock('@mapbox/mapbox-gl-draw', () => {
	return () => ({
		set: jest.fn(),
	});
});

const MlNavigationCompassTestComponent = (props) => {
	const [componentVisible, setComponentVisible] = useState(true);

	return (
		<>
			<MapLibreMap />

			{componentVisible && <MlNavigationCompass {...props} />}

			<button
				className="toggle_layer_visible"
				data-testid="toggle_layer_visible"
				onClick={() => {
					setComponentVisible(!componentVisible);
				}}
			>
				toggle component
			</button>
		</>
	);
};

const testAttributes = {};

describe('<MlNavigationCompass>', () => {
	it('should register 1 event listener to the maplibre instance', async () => {
		render(
			<MapComponentsProvider>
				<MlNavigationCompassTestComponent {...testAttributes} />
			</MapComponentsProvider>
		);

		// MapLibreGlWrapper now subscribes to "data", "move" events on its own
		await waitFor(() => expect(mockMapLibreMethods.on).toHaveBeenCalledTimes(5));
	});

	it('should deregister 1 event listener to the maplibre instance', async () => {
		render(
			<MapComponentsProvider>
				<MlNavigationCompassTestComponent {...testAttributes} />
			</MapComponentsProvider>
		);

		// MapLibreGlWrapper now subscribes to "data", "move" events on its own
		expect(mockMapLibreMethods.on).toHaveBeenCalledTimes(5);

		await userEvent.click(screen.getByTestId('toggle_layer_visible'));

		expect(mockMapLibreMethods.off).toHaveBeenCalledTimes(2);
	});
});
