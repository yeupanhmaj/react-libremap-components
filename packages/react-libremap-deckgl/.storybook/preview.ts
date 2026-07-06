import type { Preview } from '@storybook/react-vite';
import './style.css';

const preview: Preview = {
	parameters: {
		docs: {
			story: {
				inline: false,
				iframeHeight: 400,
			},
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
					{ value: 'light', right: '☀️', title: 'Light mode' },
					{ value: 'dark', right: '🌙', title: 'Dark mode' },
				],
			},
		},
	},
	tags: ['autodocs'],
};

export default preview;
