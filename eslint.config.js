import nx from '@nx/eslint-plugin';
import { defineConfig } from 'eslint/config';
import reactHooks from 'eslint-plugin-react-hooks';
import storybook from 'eslint-plugin-storybook';
import globals from 'globals';

export default defineConfig(
	{
		ignores: [
			'**/.cache',
			'**/.github',
			'**/.storybook',
			'**/.vscode',
			'**/config',
			'**/coverage',
			'**/dist',
			'**/docs',
			'**/docs-build',
			'**/js-docs',
			'**/node_modules',
			'**/storybook-static',
			'**/scripts',
			'**/vite.config.*.timestamp*',
			'**/vitest.config.*.timestamp*',
			'**/eslintErrorTest.js',
			'**/old_src',
		],
	},
	nx.configs['flat/base'],
	nx.configs['flat/typescript'],
	nx.configs['flat/javascript'],
	{
		plugins: { 'react-hooks': reactHooks },
		rules: reactHooks.configs['recommended-latest'].rules,
	},
	{
		languageOptions: {
			globals: {
				...globals.browser,
				...globals.node,
				...globals.jest,
			},
		},
		rules: {
			'@nx/enforce-module-boundaries': [
				'error',
				{
					enforceBuildableLibDependency: true,
					allow: ['^.*/eslint(\\.base)?\\.config\\.[cm]?[jt]s$'],
					depConstraints: [
						{
							sourceTag: '*',
							onlyDependOnLibsWithTags: ['*'],
						},
					],
				},
			],
		},
	},
	storybook.configs['flat/recommended']
);
