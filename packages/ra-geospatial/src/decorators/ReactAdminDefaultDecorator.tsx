import { MapComponentsProvider, MapLibreMap } from '@mapcomponents/react-maplibre';
import type React from 'react';
import { Admin, CustomRoutes, defaultLightTheme } from 'react-admin';
import { Route } from 'react-router-dom';
import DataContextProvider from '../contexts/DataContext';
import { dataProvider } from '../contexts/dataProvider';

export const ReactAdminDefaultDecorator = (Story: React.ComponentType, context: any) => (
	<DataContextProvider>
		<MapComponentsProvider>
			<Admin
				dataProvider={dataProvider}
				layout={context.parameters?.layout}
				theme={defaultLightTheme}
				key={context.parameters?.name}
			>
				<CustomRoutes>
					<Route path={'/'} element={<Story />} />
				</CustomRoutes>
			</Admin>
			{!context.args.embeddedMap && (
				<MapLibreMap
					mapId="map_1"
					options={{
						zoom: 14.5,
						style: 'https://wms.wheregroup.com/tileserver/style/klokantech-basic.json',
						center: [7.080590113226776, 50.740545567043426],
					}}
					style={{
						position: 'absolute',
						top: 0,
						right: 0,
						left: 0,
						bottom: 0,
					}}
				/>
			)}
		</MapComponentsProvider>
	</DataContextProvider>
);
