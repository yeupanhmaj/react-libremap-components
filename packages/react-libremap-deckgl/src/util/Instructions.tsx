import { useEffect, useRef, useState } from 'react';
import type { JSX } from 'react/jsx-runtime';
import BubbleStyle from './BubbleForInstructions.js';

interface StepObject {
	duration: number;
	props: object;
	content: JSX.Element;
}

interface InstructionProps {
	steps: Array<StepObject>;
	open: boolean;
	callback?: () => void;
}

const Instructions = (props: InstructionProps) => {
	const [activeStep, setActiveStep] = useState<number>();
	const initializedRef = useRef(false);

	const activateStep = (stepId?: number | undefined) => {
		let _nextStep: number | undefined = typeof stepId === 'undefined' ? 0 : stepId + 1;
		if (typeof _nextStep !== 'undefined') {
			if (_nextStep > props.steps.length + 1) {
				_nextStep = undefined;
			} else {
				setTimeout(() => {
					activateStep(_nextStep);
				}, props.steps[_nextStep].duration);
			}
		}
		setActiveStep(_nextStep);
	};
	useEffect(() => {
		if (props.open && !initializedRef.current) {
			initializedRef.current = true;
			activateStep();
		}
		if (!props.open) {
			initializedRef.current = false;
			setActiveStep(undefined);
		}
	}, [props.open]);

	return (
		<>
			{typeof activeStep !== 'undefined' && (
				<div style={{ transition: 'opacity 150ms ease-in-out', opacity: 1 }}>
					<BubbleStyle {...props.steps[activeStep].props}>
						{props.steps[activeStep].content}
					</BubbleStyle>
				</div>
			)}
		</>
	);
};

export default Instructions;
