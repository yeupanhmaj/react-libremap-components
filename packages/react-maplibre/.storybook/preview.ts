import type { Preview } from '@storybook/react-vite';
import './style.css';

const preview: Preview = {
	parameters: {
		docs: {
			inlineStories: false,
		},
	},
	globalTypes: {
		theme: {
			name: 'Theme',
			title: 'Theme',
			description: 'Theme for your components',
			defaultValue: 'light',
			toolbar: {
				icon: 'paintbrush',
				dynamicTitle: true,
				items: [
					{ value: 'light', left: '☀️', title: 'Light mode' },
					{ value: 'dark', left: '🌙', title: 'Dark mode' },
				],
			},
		},
	},
	tags: ['autodocs'],
};

export default preview;
