import type {
	EagIconCache,
	EagTrackingMapIconConfig,
} from '../../types/tracking-map-display-interface';

export async function preLoadListIcons(
	list?: EagTrackingMapIconConfig[]
): Promise<EagIconCache | undefined> {
	const cache: EagIconCache = {};
	if (!list || list.length === 0) return undefined;

	await Promise.all(
		list.map(
			(item) =>
				new Promise<void>((resolve, reject) => {
					const img = new Image();
					img.onload = () => {
						cache[`${item.name}`] = img;
						resolve();
					};
					img.onerror = reject;
					img.src = item.src;
				})
		)
	);

	return cache;
}

export function loadLeafletDefaultIcon(): HTMLImageElement {
	const iconUrl = '/images/truck-blue-01.png';

	const img = new Image();
	img.src = iconUrl;
	return img;
}
