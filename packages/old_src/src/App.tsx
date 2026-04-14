import { Flex, Input, Splitter } from 'antd';
import { useState } from 'react';
import { EagMapDisplay } from '.';

const key = import.meta.env.VITE_API_KEY;
const App = () => {
	const [apiKey, setApiKey] = useState<string>(key);
	const [center, setCenter] = useState<[number, number]>([51, 8]);
	const [geoJson, setGeoJson] = useState<GeoJSON.Feature[]>(
		localStorage.getItem('geoJson') ? JSON.parse(localStorage.getItem('geoJson')!) : []
	);

	return (
		<Flex
			style={{
				padding: 8,
				height: '100vh',
				width: '100vw',
				boxShadow: '0 0 10px rgba(0, 0, 0, 0.1)',
			}}
		>
			<Splitter
				style={{
					height: '100%',
					width: '100vw',
					boxShadow: '0 0 10px rgba(0, 0, 0, 0.1)',
				}}
			>
				<Splitter.Panel collapsible>
					<Flex
						gap={8}
						style={{
							height: '32px',
						}}
					>
						<Input.Password
							placeholder="api key"
							value={apiKey}
							onChange={(e) => setApiKey(e.target.value)}
						/>
						<Input
							placeholder="Latitude"
							value={center[0]}
							onChange={(event) => {
								const nextLat = parseFloat(event.target.value);
								if (Number.isNaN(nextLat)) return;
								setCenter([nextLat, center[1]]);
							}}
						/>
						<Input
							placeholder="Longitude"
							value={center[1]}
							onChange={(event) => {
								const nextLng = parseFloat(event.target.value);
								if (Number.isNaN(nextLng)) return;
								setCenter([center[0], nextLng]);
							}}
						/>
					</Flex>
					<Flex style={{ height: 'calc(100% - 40px)', marginTop: 8 }}>
						<EagMapDisplay
							key={apiKey}
							apiKey={apiKey}
							showDrawControls
							center={center}
							onCenterChanged={([newLat, newLng]) => {
								setCenter([newLat, newLng]);
							}}
							geoJson={geoJson}
							onGeoJsonChange={(e) => {
								localStorage.setItem('geoJson', JSON.stringify(e));
								setGeoJson(e);
							}}
							zoom={13}
							onZoomChanged={(zoom) => console.log('Zoom changed:', zoom)}
							flyToOnCenterChange
						/>
					</Flex>
				</Splitter.Panel>
			</Splitter>
		</Flex>
	);
};

export default App;
