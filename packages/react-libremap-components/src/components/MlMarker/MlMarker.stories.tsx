import type { StoryFn } from '@storybook/react-vite';
import { useState } from 'react';
import mapContextDecorator from '../../decorators/MapContextDecorator';
import MlMarker, { type MlMarkerProps } from './MlMarker';
import MlTextLayer from '../MlTextLayer/MlTextLayer';

const storyoptions = {
	title: 'MapComponents/MlMarker',
	component: MlMarker,
	decorators: mapContextDecorator,
	parameters: {
		docs: {
			description: {
				component:
					'A customizable marker component for MapLibre maps that supports rich HTML content.',
			},
		},
	},
	argTypes: {
		lng: {
			control: { type: 'number', step: 0.0001 },
		},
		lat: {
			control: { type: 'number', step: 0.0001 },
		},
		contentOffset: {
			control: { type: 'range', min: 0, max: 20, step: 1 },
		},
		markerStyle: {
			control: { type: 'object' },
		},
		containerStyle: {
			control: { type: 'object' },
		},
		iframeStyle: {
			control: { type: 'object' },
		},
		iframeBodyStyle: {
			control: { type: 'object' },
		},
		passEventsThrough: {
			control: { type: 'boolean' },
		},
	},
};

export default storyoptions;

const Template: StoryFn<typeof MlMarker> = (args) => (
	<>
		<MlMarker {...args} />
	</>
);

export const ExampleConfig = Template.bind({});
ExampleConfig.args = {
	lng: 7.0851268,
	lat: 50.73884,
	mapId: 'map_1',
	content: `
    <div style="padding: 12px; font-family: Arial, sans-serif; max-width: 220px;">
      <div style="font-size: 18px; font-weight: bold; margin-bottom: 8px; color: #3b82f6;">WhereGroup</div>
      <div style="display: flex; align-items: center; margin-bottom: 10px;">
        <span style="color: #6b7280; font-size: 14px;">Bonn, Germany</span>
      </div>
      <p>
        Geospatial technologies and open-source GIS solutions.
      </p>
      <div style="font-size: 13px; color: #6b7280;">
        <div>📍 50.73884, 7.0851268</div>
      </div>
    </div>
  `,
	containerStyle: {
		borderRadius: '8px',
		boxShadow: '0 4px 12px rgba(0,0,0,0.1)',
		overflow: 'hidden',
		backgroundColor: 'white',
	},
} satisfies Partial<MlMarkerProps>;

export const CustomStyledMarker = Template.bind({});
CustomStyledMarker.args = {
	lng: 7.0851268,
	lat: 50.73884,
	anchor: 'top-right',
	passEventsThrough: false,
	markerStyle: {
		width: '15px',
		height: '15px',
		background: 'linear-gradient(135deg, #f093fb 0%, #f5576c 100%)',
		border: '2px solid rgba(255, 255, 255, 0.7)',
		borderRadius: '50%',
		boxShadow: '0 6px 12px rgba(90,0,0,0.2), 0 0 0 4px rgba(240,147,251,0.2)',
	},
	containerStyle: {
		backgroundColor: 'rgba(255, 255, 255, 0.9)',
		boxShadow: '4px 12px 24px rgba(0,0,0,0.15)',
		borderRadius: '14px',
		border: '1px solid rgba(200, 200, 200, 0.3)',
		backdropFilter: 'blur(12px)',
		maxWidth: '300px',
	},
	iframeBodyStyle: {
		fontFamily: 'system-ui, -apple-system, BlinkMacSystemFont, sans-serif',
	},
	iframeStyle: {
		borderRadius: '14px',
		overflow: 'hidden',
	},
	content: `
    <style>
      .custom-marker-container {
        padding: 16px;
        color: #444;
      }
      .custom-marker-header {
        font-size: 18px;
        font-weight: 600;
        color: #f5576c;
        margin-bottom: 10px;
      }
      .custom-marker-details {
        display: flex;
        margin-bottom: 12px;
        align-items: center;
      }
      .custom-marker-icon {
        width: 38px;
        height: 38px;
        background: #ffe0ed;
        border-radius: 50%;
        display: flex;
        align-items: center;
        justify-content: center;
        margin-right: 12px;
      }
      .custom-marker-icon-content {
        color: #f5576c;
        font-size: 16px;
      }
      .custom-marker-info {
        font-weight: 500;
      }
      .custom-marker-subinfo {
        font-size: 13px;
        color: #777;
        margin-top: 2px;
      }
      .custom-marker-box {
        background: #ffe0ed;
        border-radius: 8px;
        padding: 10px;
        font-size: 13px;
      }
      .custom-marker-box div {
        margin-bottom: 4px;
      }
      .custom-marker-status {
        color: #22c55e;
      }
    </style>
    <div class="custom-marker-container">
      <div class="custom-marker-header">Location Details</div>
      <div class="custom-marker-details">
        <div class="custom-marker-icon">
          <div class="custom-marker-icon-content">📍</div>
        </div>
        <div>
          <div class="custom-marker-info">WhereGroup Headquarters</div>
          <div class="custom-marker-subinfo">Bonn, Germany</div>
        </div>
      </div>
      <div class="custom-marker-box">
        <div><strong>Coordinates:</strong> 50.73884, 7.0851268</div>
        <div><strong>Status:</strong> <span class="custom-marker-status">Active</span></div>
        <div><strong>Last updated:</strong> Today</div>
      </div>
    </div>
  `,
} satisfies Partial<MlMarkerProps>;

/**
 * Demonstrates the controlled close pattern using `onClose`.
 * The parent holds a visibility flag and passes `onClose` to reset it.
 * Click the × button on the marker to dismiss it, then use the
 * "Show marker again" button to restore it.
 */
export const WithOnClose: StoryFn<typeof MlMarker> = () => {
	const [show, setShow] = useState(true);

	return (
		<>
			{show ? (
				<MlMarker
					lng={7.0851268}
					lat={50.73884}
					mapId="map_1"
					passEventsThrough={false}
					onClose={() => setShow(false)}
					content={`
            <div style="padding: 12px; font-family: Arial, sans-serif;">
              <div style="font-size: 16px; font-weight: bold; margin-bottom: 6px;">Controlled marker</div>
              <p style="margin: 0; color: #555;">
                Click the <strong>×</strong> button to dismiss this marker.<br/>
                The parent component controls visibility via <code>onClose</code>.
              </p>
            </div>
          `}
				/>
			) : (
				<button
					type="button"
					style={{
						position: 'absolute',
						top: 16,
						left: '50%',
						transform: 'translateX(-50%)',
						zIndex: 10,
						background: 'white',
						padding: '8px 16px',
						borderRadius: 8,
						boxShadow: '0 2px 8px rgba(0,0,0,0.2)',
						cursor: 'pointer',
						fontFamily: 'sans-serif',
						fontSize: 14,
						border: 'none',
					}}
					onClick={() => setShow(true)}
				>
					Show marker again
				</button>
			)}
		</>
	);
};

/**
 * Two independent markers each register their own context-menu items via
 * `useMapContextMenu`.  Because both components share the same
 * `<MapContextMenuProvider>` (provided by the story decorator), right-clicking
 * the map shows a **single** combined menu containing items from both markers.
 */
export const SharedContextMenu: StoryFn<typeof MlMarker> = () => {
	const [lngA, setLngA] = useState(7.0651268);
	const [latA, setLatA] = useState(50.73884);
	const [lngB, setLngB] = useState(7.1051268);
	const [latB, setLatB] = useState(50.73884);

	return (
		<>
			<MlMarker
				lng={lngA}
				lat={latA}
				mapId="map_1"
				passEventsThrough={false}
				markerStyle={{
					background: 'linear-gradient(135deg, #60a5fa 0%, #3b82f6 100%)',
					width: '14px',
					height: '14px',
				}}
				onSetCenter={(lng, lat) => {
					setLngA(lng);
					setLatA(lat);
				}}
				content="
					<div style='padding:12px;font-family:Arial,sans-serif'>
						<div style='font-size:16px;font-weight:bold;color:#3b82f6;margin-bottom:6px'>Marker A</div>
						<p style='margin:0;font-size:13px;color:#555'>Right-click the map — both markers share one menu.</p>
					</div>
				"
			/>
			<MlMarker
				lng={lngB}
				lat={latB}
				mapId="map_1"
				passEventsThrough={false}
				markerStyle={{
					background: 'linear-gradient(135deg, #f87171 0%, #ef4444 100%)',
					width: '14px',
					height: '14px',
				}}
				onSetCenter={(lng, lat) => {
					setLngB(lng);
					setLatB(lat);
				}}
				content="
					<div style='padding:12px;font-family:Arial,sans-serif'>
						<div style='font-size:16px;font-weight:bold;color:#ef4444;margin-bottom:6px'>Marker B</div>
						<p style='margin:0;font-size:13px;color:#555'>No duplicate menus, even with two components!</p>
					</div>
				"
			/>
			<MlTextLayer />
		</>
	);
};

/**
 * Right-click anywhere on the map and select "📍 Set center" to move the marker
 * to that position. The coordinates display updates in real time.
 */
export const WithSetCenter: StoryFn<typeof MlMarker> = () => {
	const [lng, setLng] = useState(7.0851268);
	const [lat, setLat] = useState(50.73884);

	return (
		<MlMarker
			lng={lng}
			lat={lat}
			mapId="map_1"
			passEventsThrough={false}
			onSetCenter={(newLng, newLat) => {
				setLng(newLng);
				setLat(newLat);
			}}
			content={`
            <div style="padding: 12px; font-family: Arial, sans-serif;">
              <div style="font-size: 16px; font-weight: bold; margin-bottom: 8px;">📍 Movable marker</div>
              <p style="margin: 0 0 6px; color: #555; font-size: 13px;">
                Right-click anywhere on the map and choose
                <strong> Set center</strong> to move this marker.
              </p>
              <div style="font-size: 12px; color: #888; font-family: monospace;">
                lng: ${lng.toFixed(6)}<br/>
                lat: ${lat.toFixed(6)}
              </div>
            </div>
          `}
		/>
	);
};
