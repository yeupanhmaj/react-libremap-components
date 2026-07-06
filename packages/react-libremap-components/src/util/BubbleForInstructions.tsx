import type React from 'react';

export interface BubbleForInstructionProps {
	bubbleRight?: string;
	bubbleLeft?: string;
	bubbleTop?: string;
	bubbleBottom?: string;
	zIndex: string;
	textMarginTop: string;
	textMarginLeft: string;
	iconTransform: string;
	iconMarginTop: string;
	iconMarginLeft: string;
	children?: React.ReactNode;
}

function BubbleForInstruction(props: BubbleForInstructionProps) {
	return (
		<div
			style={{
				width: '475px',
				height: '475px',
				position: 'fixed',
				display: 'block',
				borderRadius: '360px',
				backgroundColor: '#1976d2',
				right: props.bubbleRight,
				bottom: props.bubbleBottom,
				left: props.bubbleLeft,
				top: props.bubbleTop,
				zIndex: Number.parseInt(props.zIndex) || 1000,
			}}
		>
			<h5
				style={{
					fontSize: '1.5rem',
					fontWeight: 'inherit',
					margin: 0,
					marginTop: props.textMarginTop,
					marginLeft: props.textMarginLeft,
					color: '#fff',
					textAlign: 'left',
				}}
			>
				<b>{props.children}</b>
			</h5>
			{/* TODO: add icon*/}
		</div>
	);
}
export default BubbleForInstruction;
