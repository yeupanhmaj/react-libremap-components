import type React from 'react';

import type { StoryContext } from '@storybook/react-vite';
import { MapComponentsProvider } from '../index';
import './style.css';

const decorators = [
	(Story: React.FC, _context?: StoryContext): React.ReactElement => {
		return (
			<div className="fullscreen_map">
				<MapComponentsProvider>
					<Story />
				</MapComponentsProvider>
			</div>
		);
	},
];

export default decorators;
