import { useState } from 'react';
import { ChromePicker } from 'react-color';
import { converters } from './transformers';

export interface ColorPickerProps {
	onChange?: (value: string) => void;
	convert: 'rgb' | 'rgba' | 'rgba_hex' | 'hex' | 'rgba_rgb';
	value?: string;
}

const ColorPicker = ({ convert = 'hex', ...props }: ColorPickerProps) => {
	const [showPicker, setShowPicker] = useState(false);
	const value = props?.value || '';

	return (
		<>
			<div style={{ display: 'flex', flexWrap: 'nowrap', width: '100%' }}>
				<div style={{ width: '100%' }}>
					<button
						type="button"
						onClick={() => setShowPicker(true)}
						style={{
							minWidth: '100%',
							padding: '5px',
							marginBottom: '10px',
							display: 'flex',
							alignItems: 'center',
							justifyContent: 'flex-start',
							border: '1px solid currentColor',
							backgroundColor: 'transparent',
							color: 'inherit',
							cursor: 'pointer',
							borderRadius: '4px',
							fontFamily: 'inherit',
							fontSize: 'inherit',
						}}
					>
						<div
							style={{
								width: '25px',
								height: '25px',
								marginRight: '10px',
								backgroundColor: value,
							}}
						/>

						{value}
					</button>
				</div>
			</div>
			{showPicker && (
				<div style={{ position: 'relative', marginTop: 0 }}>
					<div style={{ position: 'absolute', zIndex: 1000 }}>
						{/** biome-ignore lint/a11y/noStaticElementInteractions: needed for action */}
						{/** biome-ignore lint/a11y/useKeyWithClickEvents: needed for action */}
						<div
							style={{ position: 'fixed', top: '0px', right: '0px', bottom: '0px', left: '0px' }}
							onClick={() => {
								setShowPicker(false);
							}}
						/>
						<ChromePicker
							color={value}
							onChange={(c: any) => {
								const newValue = converters[convert](c);
								props?.onChange?.(newValue);
							}}
						/>
					</div>
				</div>
			)}
		</>
	);
};

ColorPicker.defaultProps = {
	convert: 'rgba_hex',
	label: 'Color',
	name: 'color',
};

export default ColorPicker;
