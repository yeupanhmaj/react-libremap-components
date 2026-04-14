const Black = '#000000';
const Pink = '#c026d3';
const Orange = '#fb923c';
const Brown = '#92400e';
const Green = '#22c55e';
const Blue = '#2563eb';
const Red = '#ef4444';
const Purple = '#8b5cf6';

export type GeomanColorOptionsType =
	| typeof Black
	| typeof Pink
	| typeof Orange
	| typeof Brown
	| typeof Green
	| typeof Blue
	| typeof Red
	| typeof Purple;

export const GeomanColorOptions = {
	Black,
	Pink,
	Orange,
	Brown,
	Green,
	Blue,
	Red,
	Purple,
} as const satisfies Record<string, GeomanColorOptionsType>;
