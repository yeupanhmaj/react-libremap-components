import { render, screen, waitFor } from '@testing-library/react';
import userEvent from '@testing-library/user-event';
import React, { useState } from 'react';
import { MapComponentsProvider } from '../../contexts/MapContext';
import MapLibreMap from './../MapLibreMap/MapLibreMap';
import MlFollowGps from './MlFollowGps';

const mockGeolocation = {
	watchPosition: jest.fn(() => 1),
	clearWatch: jest.fn(),
};

global.navigator.geolocation = mockGeolocation;

const MlFollowGPSTestComponent = (props) => {
	const [componentVisible, setComponentVisible] = useState(true);

	return (
		<>
			<MapLibreMap />

			{componentVisible && <MlFollowGps {...props} />}

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

describe('<MlFollowGps>', () => {
	it('should call navigator.geolocation.watchPosition once', async () => {
		render(
			<MapComponentsProvider>
				<MlFollowGPSTestComponent {...testAttributes} />
			</MapComponentsProvider>
		);

		await userEvent.click(screen.getByTestId('mlFollowGpsBtn'));
		await waitFor(() => expect(mockGeolocation.watchPosition).toHaveBeenCalledTimes(1));
	});

	it('should call navigator.geolocation.clearWatch once, after MlFollowGPSButton has been pressed twice', async () => {
		render(
			<MapComponentsProvider>
				<MlFollowGPSTestComponent {...testAttributes} />
			</MapComponentsProvider>
		);

		await userEvent.click(screen.getByTestId('mlFollowGpsBtn'));
		await userEvent.click(screen.getByTestId('mlFollowGpsBtn'));
		//wrapper.find(".toggle_layer_visible").simulate("click");

		await waitFor(() => expect(mockGeolocation.clearWatch).toHaveBeenCalledTimes(1));
	});
});
