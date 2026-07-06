function BubbleForInstruction(props) {
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
			<svg
				viewBox="0 0 24 24"
				style={{
					color: '#fff',
					width: '80px',
					height: '80px',
					position: 'absolute',
					transform: props.iconTransform,
					marginTop: props.iconMarginTop,
					marginLeft: props.iconMarginLeft,
					fill: 'currentColor',
					display: 'inline-block',
				}}
			>
				<path d="M7 8V5l-7 7 7 7v-3l-4-4 4-4zm11 2.4V7l-7 7 7 7v-3.1c5 0 8.5 1.6 11 5.1-1-5-4-10-11-11z" />
			</svg>
		</div>
	);
}
export default BubbleForInstruction;
