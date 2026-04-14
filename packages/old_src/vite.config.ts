import react from '@vitejs/plugin-react';
import path from 'path';
import { defineConfig } from 'vite';
import { libInjectCss } from 'vite-plugin-lib-inject-css';

export default defineConfig({
	plugins: [react(), libInjectCss()],
	build: {
		lib: {
			entry: path.resolve(__dirname, 'src/index.ts'), // main export file
			name: 'EagMapDisplay',
			fileName: () => `eag-map-display.js`,
			formats: ['es'],
		},
		rollupOptions: {
			// Externalize peer dependencies
			external: ['react', 'react-dom', 'ol'],
			output: {
				globals: {
					react: 'React',
					'react-dom': 'ReactDOM',
					ol: 'ol',
				},
			},
		},
	},
	resolve: {
		alias: {
			$: path.resolve(__dirname, './src'),
			$libs: path.resolve(__dirname, './src/libs'),
		},
	},
});
