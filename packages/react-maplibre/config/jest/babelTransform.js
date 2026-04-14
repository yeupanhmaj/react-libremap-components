import { createTransformer } from 'babel-jest';

const hasJsxRuntime = (() => {
	if (process.env.DISABLE_NEW_JSX_TRANSFORM === 'true') {
		return false;
	}

	try {
		require.resolve('react/jsx-runtime');
		return true;
	} catch (e) {
		console.error(
			'The new JSX transform is not available in your version of React. Please upgrade to React 17 or later.',
			e
		);
		return false;
	}
})();

export default createTransformer({
	presets: [
		[
			require.resolve('babel-preset-react-app'),
			{
				runtime: hasJsxRuntime ? 'automatic' : 'classic',
			},
		],
	],
	babelrc: false,
	configFile: false,
});
