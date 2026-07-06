import * as fs from 'node:fs';
import * as path from 'node:path';
import { nxCopyAssetsPlugin } from '@nx/vite/plugins/nx-copy-assets.plugin';
import { nxViteTsPaths } from '@nx/vite/plugins/nx-tsconfig-paths.plugin';
import react from '@vitejs/plugin-react';
import { defineConfig } from 'vite';
import dts from 'vite-plugin-dts';

const pkg = JSON.parse(fs.readFileSync('package.json', 'utf8'));

/** Writes a trimmed, publish-ready package.json into dist/ after each build.
 *  Required because pnpm expects a package.json to exist in publishConfig.directory.
 */
function writeDistPackageJson(): import('vite').Plugin {
	return {
		name: 'write-dist-package-json',
		closeBundle() {
			const { scripts, devDependencies, jest, publishConfig, ...rest } = pkg;
			const distPkg = {
				...rest,
				// Apply publishConfig field overrides so paths are relative to dist/ root
				...(publishConfig?.main && { main: publishConfig.main }),
				...(publishConfig?.module && { module: publishConfig.module }),
				...(publishConfig?.types && { types: publishConfig.types }),
				// Keep publishConfig but strip 'directory' — we're already in dist
				publishConfig: {
					registry: publishConfig?.registry,
					access: publishConfig?.access,
				},
			};
			fs.writeFileSync(
				path.join(__dirname, 'dist/package.json'),
				`${JSON.stringify(distPkg, null, 2)}\n`
			);
		},
	};
}

export default defineConfig(() => ({
	root: __dirname,
	cacheDir: '../../node_modules/.vite/packages/react-maplibre',
	publicDir: false as const,
	plugins: [
		react(),
		nxViteTsPaths(),
		nxCopyAssetsPlugin(['*.md']),
		writeDistPackageJson(),
		dts({
			entryRoot: 'src',
			tsconfigPath: path.join(__dirname, 'tsconfig.lib.json'),
			pathsToAliases: false,
		}),
	],
	// Uncomment this if you are using workers.
	// worker: {
	//  plugins: [ nxViteTsPaths() ],
	// },
	// Configuration for building your library.
	// See: https://vitejs.dev/guide/build.html#library-mode
	build: {
		outDir: 'dist',
		emptyOutDir: true,
		reportCompressedSize: true,
		commonjsOptions: {
			transformMixedEsModules: true,
		},
		lib: {
			// Could also be a dictionary or array of multiple entry points.
			entry: 'src/index.ts',
			name: 'gpms-map-components',
			fileName: 'index',
			// Change this to the formats you want to support.
			// Don't forget to update your package.json as well.
			formats: ['es' as const, 'cjs' as const],
		},
		sourcemap: true,
		rollupOptions: {
			// External packages that should not be bundled into your library.
			external: [
				'react',
				'react-dom',
				'd3',
				'sql.js',
				'maplibre-gl/dist/maplibre-gl.css',
				'maplibre-gl',
				...Object.keys(pkg.dependencies || {}),
				...Object.keys(pkg.peerDependencies || {}),
				...Object.keys(pkg.devDependencies || {}),
			],
			input: [path.join(__dirname, 'src/index.ts')],
		},
	},
}));
