import { nxViteTsPaths } from '@nx/vite/plugins/nx-tsconfig-paths.plugin';
import type { StorybookConfig } from '@storybook/react-vite';
import { mergeConfig } from 'vite';

const config: StorybookConfig = {
	stories: ['../src/**/*.@(mdx|stories.@(js|jsx|ts|tsx))'],
	addons: ['@storybook/addon-docs'],
	framework: {
		name: '@storybook/react-vite',
		options: {},
	},
	staticDirs: ['../public'],

	viteFinal: async (config) =>
		mergeConfig(config, {
			plugins: [nxViteTsPaths()],
		}),

	typescript: {
		check: false,
		reactDocgen: 'react-docgen-typescript',
		reactDocgenTypescriptOptions: {
			shouldExtractLiteralValuesFromEnum: true,
			propFilter: (prop) => (prop.parent ? !/node_modules/.test(prop.parent.fileName) : true),
		},
	},
};

export default config;
