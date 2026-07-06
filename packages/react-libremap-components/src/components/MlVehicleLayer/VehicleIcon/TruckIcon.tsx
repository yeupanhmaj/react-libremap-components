import { useId } from 'react';

// ─── Types ────────────────────────────────────────────────────────────────────

export interface TruckIconProps extends React.SVGProps<SVGSVGElement> {
	/** The main body / cab color of the truck. */
	primaryColor: string;
	/**
	 * The darker accent color used for the 3 interior cab stripes.
	 * Defaults to `primaryColor` when omitted.
	 */
	stripeColor?: string;
	/**
	 * Accessible title for screen readers.
	 * Defaults to "Truck icon". Pass an empty string only if the parent
	 * context already provides a label via `aria-labelledby`.
	 */
	title?: string;
}

export const TRUCK_ICON_COLORS = {
	'blue-01': { primaryColor: '#2950DA', stripeColor: '#2950DA' },
	'blue-02': { primaryColor: '#A8B8F0', stripeColor: '#A8B8F0' },
	'gray-01': { primaryColor: '#AFAFAF', stripeColor: '#999999' },
	'gray-02': { primaryColor: '#D9D9D9', stripeColor: '#999999' },
	'green-01': { primaryColor: '#24A87C', stripeColor: '#24A87C' },
	'green-02': { primaryColor: '#ABEDD7', stripeColor: '#ABEDD7' },
	'orange-01': { primaryColor: '#FC7C00', stripeColor: '#D86A00' },
	'orange-02': { primaryColor: '#FFCB99', stripeColor: '#D86A00' },
	'red-01': { primaryColor: '#F23030', stripeColor: '#930E0E' },
	'red-02': { primaryColor: '#FF9999', stripeColor: '#930E0E' },
	'yellow-01': { primaryColor: '#E5D700', stripeColor: '#DACD0B' },
	'yellow-02': { primaryColor: '#FFF999', stripeColor: '#DACD0B' },
} as const;

export type TruckIconVariant = keyof typeof TRUCK_ICON_COLORS;

// ─── Base component ───────────────────────────────────────────────────────────

/**
 * A single-color truck icon rendered as an inline SVG.
 *
 * Using `useId()` for the internal SVG `filter` and `clipPath` ids ensures
 * every rendered instance gets unique ids, preventing conflicts when
 * multiple icons appear in the same document.
 *
 * @example
 * ```tsx
 * // Custom color
 * <TruckIcon primaryColor="#2950DA" width={40} height={40} />
 *
 * // Preset variant with different primary and stripe colors
 * <TruckIcon primaryColor="#F23030" stripeColor="#930E0E" />
 * ```
 */
const TruckIcon = ({
	primaryColor,
	stripeColor,
	title = 'Truck icon',
	...svgProps
}: TruckIconProps) => {
	const uid = useId();
	// Sanitize the uid so it's safe as an XML id (remove colons inserted by React)
	const safeUid = uid.replace(/:/g, '');
	const filterId = `truck-filter-${safeUid}`;
	const clipId = `truck-clip-${safeUid}`;
	const stripe = stripeColor ?? primaryColor;

	return (
		<svg
			width="70"
			height="70"
			viewBox="0 0 70 70"
			fill="none"
			xmlns="http://www.w3.org/2000/svg"
			{...svgProps}
		>
			<title>{title}</title>
			<g clipPath={`url(#${clipId})`}>
				<g filter={`url(#${filterId})`}>
					{/* Rear exhaust detail */}
					<path d="M39.8 65.3999H38V69.3999H39.8V65.3999Z" fill="#E1E2E2" />

					{/* Antenna – right stack */}
					<path
						d="M40.4618 1.63977C40.3458 1.13577 39.8978 0.759766 39.3598 0.759766C38.8218 0.759766 38.3738 1.13577 38.2598 1.63977H40.4618Z"
						fill="#FDEDBC"
					/>
					{/* Antenna – left stack */}
					<path
						d="M31.2352 1.63977C31.1192 1.13577 30.6712 0.759766 30.1332 0.759766C29.5952 0.759766 29.1472 1.13577 29.0332 1.63977H31.2352Z"
						fill="#FDEDBC"
					/>
					{/* Antenna mounting bar */}
					<path
						d="M41.5496 2.1999C41.5496 2.6219 41.3796 2.9999 41.1696 2.9999H28.2316C28.0216 2.9999 27.8516 2.6219 27.8516 2.1999C27.8516 1.7759 28.0216 1.3999 28.2316 1.3999H41.1696C41.3796 1.3999 41.5496 1.7759 41.5496 2.1999Z"
						fill="#000D20"
					/>
					{/* Antenna connector */}
					<path d="M37.6008 1.19971H31.8008V1.79971H37.6008V1.19971Z" fill="#FDEDBC" />

					{/* Cab */}
					<path
						d="M41.3555 16.734V3.836C41.3555 2.844 40.6915 2.104 40.2795 2.104H29.0155C28.5635 2.104 27.8555 2.886 27.8555 3.906V16.736H41.3555V16.734Z"
						fill={primaryColor}
					/>

					{/* Container / cargo box – front face */}
					<path
						d="M34.6056 7.12793C33.2696 7.12793 30.4436 7.42793 29.2676 8.03393L31.1396 13.3999H38.0736L39.9456 8.03393C38.7676 7.42793 35.9436 7.12793 34.6076 7.12793H34.6056Z"
						fill="black"
					/>
					{/* Container – left panel */}
					<path
						d="M30.4628 13.8479L28.8008 9.35791V15.9999H30.3948L30.4628 13.8479Z"
						fill="black"
					/>
					{/* Container – right panel */}
					<path
						d="M38.9512 13.8479L40.5992 9.35791V15.9999H39.0332L38.9512 13.8479Z"
						fill="black"
					/>

					{/* Cab interior stripe 1 */}
					<g opacity="0.4" style={{ mixBlendMode: 'multiply' }}>
						<path d="M37.2004 4.19971H32.4004V4.79971H37.2004V4.19971Z" fill={stripe} />
					</g>
					{/* Cab interior stripe 2 */}
					<g opacity="0.4" style={{ mixBlendMode: 'multiply' }}>
						<path d="M37.2004 4.99951H32.4004V5.59951H37.2004V4.99951Z" fill={stripe} />
					</g>
					{/* Cab interior stripe 3 */}
					<g opacity="0.4" style={{ mixBlendMode: 'multiply' }}>
						<path d="M37.2004 5.7998H32.4004V6.3998H37.2004V5.7998Z" fill={stripe} />
					</g>

					{/* Cab ↔ body top separator */}
					<path d="M41.4008 16.5996H27.8008V17.9996H41.4008V16.5996Z" fill="#000D20" />
					{/* Cab ↔ body bottom separator */}
					<path d="M38.2 17.7998H31V19.1998H38.2V17.7998Z" fill="#000D20" />

					{/* Outer body shell (creates the visible border) */}
					<path d="M43.0004 19H26.4004V67.4H43.0004V19Z" fill="#C7C8C8" />
					{/* Inner body panel */}
					<path d="M42.1992 19.7998H27.1992V66.5998H42.1992V19.7998Z" fill={primaryColor} />
					{/* Body diagonal shadow / sheen */}
					<g opacity="0.4" style={{ mixBlendMode: 'multiply' }}>
						<path d="M27.1992 66.5998L42.1992 19.7998V66.5998H27.1992Z" fill={primaryColor} />
					</g>

					{/* Bottom trim bar */}
					<path d="M43.0004 67.1997H26.4004V68.1997H43.0004V67.1997Z" fill="#000D20" />
					{/* Left tail light */}
					<path d="M28.6004 67.1997H26.4004V68.1997H28.6004V67.1997Z" fill="#F4911C" />
					{/* Right tail light */}
					<path d="M43.0008 67.1997H40.8008V68.1997H43.0008V67.1997Z" fill="#F4911C" />

					{/* Left side mirror */}
					<path
						d="M28.8003 9.24985C28.7023 8.65185 28.1843 8.19385 27.5583 8.19385H26.4803C25.8543 8.19385 25.3363 8.65185 25.2383 9.24985H28.8023H28.8003Z"
						fill={primaryColor}
					/>
					{/* Right side mirror */}
					<path
						d="M43.9819 9.24985C43.8839 8.65185 43.3659 8.19385 42.7399 8.19385H41.6619C41.0359 8.19385 40.5179 8.65185 40.4199 9.24985H43.9839H43.9819Z"
						fill={primaryColor}
					/>
				</g>
			</g>

			<defs>
				<filter
					id={filterId}
					x="25.2383"
					y="-1.24023"
					width="22.7461"
					height="72.6401"
					filterUnits="userSpaceOnUse"
					colorInterpolationFilters="sRGB"
				>
					<feFlood floodOpacity="0" result="BackgroundImageFix" />
					<feColorMatrix
						in="SourceAlpha"
						type="matrix"
						values="0 0 0 0 0 0 0 0 0 0 0 0 0 0 0 0 0 0 127 0"
						result="hardAlpha"
					/>
					<feOffset dx="2" />
					<feGaussianBlur stdDeviation="1" />
					<feColorMatrix type="matrix" values="0 0 0 0 0 0 0 0 0 0 0 0 0 0 0 0 0 0 0.2 0" />
					<feBlend mode="normal" in2="BackgroundImageFix" result="effect1_dropShadow" />
					<feBlend mode="normal" in="SourceGraphic" in2="effect1_dropShadow" result="shape" />
				</filter>
				<clipPath id={clipId}>
					<rect width="70" height="70" fill="white" />
				</clipPath>
			</defs>
		</svg>
	);
};

export default TruckIcon;

// ─── Pre-built variant components ─────────────────────────────────────────────

type VariantProps = Omit<TruckIconProps, 'primaryColor' | 'stripeColor'>;

/** Dark blue truck (primary variant) */
export const TruckBlue01 = (props: VariantProps) => (
	<TruckIcon {...TRUCK_ICON_COLORS['blue-01']} {...props} />
);

/** Light blue truck */
export const TruckBlue02 = (props: VariantProps) => (
	<TruckIcon {...TRUCK_ICON_COLORS['blue-02']} {...props} />
);

/** Dark gray truck (primary variant) */
export const TruckGray01 = (props: VariantProps) => (
	<TruckIcon {...TRUCK_ICON_COLORS['gray-01']} {...props} />
);

/** Light gray truck */
export const TruckGray02 = (props: VariantProps) => (
	<TruckIcon {...TRUCK_ICON_COLORS['gray-02']} {...props} />
);

/** Dark green truck (primary variant) */
export const TruckGreen01 = (props: VariantProps) => (
	<TruckIcon {...TRUCK_ICON_COLORS['green-01']} {...props} />
);

/** Light green truck */
export const TruckGreen02 = (props: VariantProps) => (
	<TruckIcon {...TRUCK_ICON_COLORS['green-02']} {...props} />
);

/** Dark orange truck (primary variant) */
export const TruckOrange01 = (props: VariantProps) => (
	<TruckIcon {...TRUCK_ICON_COLORS['orange-01']} {...props} />
);

/** Light orange truck */
export const TruckOrange02 = (props: VariantProps) => (
	<TruckIcon {...TRUCK_ICON_COLORS['orange-02']} {...props} />
);

/** Dark red truck (primary variant) */
export const TruckRed01 = (props: VariantProps) => (
	<TruckIcon {...TRUCK_ICON_COLORS['red-01']} {...props} />
);

/** Light red / pink truck */
export const TruckRed02 = (props: VariantProps) => (
	<TruckIcon {...TRUCK_ICON_COLORS['red-02']} {...props} />
);

/** Dark yellow truck (primary variant) */
export const TruckYellow01 = (props: VariantProps) => (
	<TruckIcon {...TRUCK_ICON_COLORS['yellow-01']} {...props} />
);

/** Light yellow truck */
export const TruckYellow02 = (props: VariantProps) => (
	<TruckIcon {...TRUCK_ICON_COLORS['yellow-02']} {...props} />
);
