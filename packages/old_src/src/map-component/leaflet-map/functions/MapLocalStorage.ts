/* eslint-disable @typescript-eslint/no-explicit-any */
type UseLocalStorageReturn = {
	getItem: (key?: string) => any[] | null;
	setItem: (value: any[], key?: string) => void;
	getColor: (key?: string) => string;
	setColor: (color: string, key?: string) => void;
	getCenter: (key?: string) => [number, number] | null;
	setCenter: (center: [number, number], key?: string) => void;
	clear: (key?: string) => void;
};

class MapLocalStorage implements UseLocalStorageReturn {
	private defaultColorKey = 'mapDataColor';
	private defaultGeoJsonKey = 'mapDataGeoJson';
	private defaultCenterKey = 'mapDataCenter';
	private initialValue?: any[];

	constructor(initialValue?: any[]) {
		this.initialValue = initialValue;
		// Initialize with the initial value if it exists
		if (initialValue !== undefined) {
			this.setItem(initialValue);
		}
	}

	private getKey(type: 'color' | 'geoJson' | 'center', customKey?: string): string {
		if (customKey) {
			return `${customKey}_${type}`;
		}
		switch (type) {
			case 'color':
				return this.defaultColorKey;
			case 'geoJson':
				return this.defaultGeoJsonKey;
			case 'center':
				return this.defaultCenterKey;
		}
	}

	getItem(key?: string): any[] | null {
		const storageKey = this.getKey('geoJson', key);
		const item = sessionStorage.getItem(storageKey);
		return item ? (JSON.parse(item) as any[]) : this.initialValue || null;
	}

	setItem(value: any[], key?: string): void {
		const storageKey = this.getKey('geoJson', key);
		sessionStorage.setItem(storageKey, JSON.stringify(value));
	}

	setColor(color: string, key?: string): void {
		const storageKey = this.getKey('color', key);
		sessionStorage.setItem(storageKey, color);
	}

	getColor(key?: string): string {
		const storageKey = this.getKey('color', key);
		const color = sessionStorage.getItem(storageKey);
		return color ? color : '#000000'; // Default color if nothing is stored
	}

	setCenter(center: [number, number], key?: string): void {
		const storageKey = this.getKey('center', key);
		sessionStorage.setItem(storageKey, JSON.stringify(center));
	}

	getCenter(key?: string): [number, number] | null {
		const storageKey = this.getKey('center', key);
		const center = sessionStorage.getItem(storageKey);
		return center ? (JSON.parse(center) as [number, number]) : null;
	}

	clear(key?: string): void {
		if (key) {
			// Clear specific key-based storage
			sessionStorage.removeItem(this.getKey('geoJson', key));
			sessionStorage.removeItem(this.getKey('color', key));
			sessionStorage.removeItem(this.getKey('center', key));
		} else {
			// Clear default storage
			sessionStorage.removeItem(this.defaultGeoJsonKey);
			sessionStorage.removeItem(this.defaultColorKey);
			sessionStorage.removeItem(this.defaultCenterKey);
		}
	}

	// Utility function to clean up all storage keys with a specific prefix
	clearAllWithPrefix(prefix: string): void {
		const keysToRemove: string[] = [];

		// Find all keys in sessionStorage that start with the prefix
		for (let i = 0; i < sessionStorage.length; i++) {
			const key = sessionStorage.key(i);
			if (key && key.startsWith(`${prefix}_`)) {
				keysToRemove.push(key);
			}
		}

		// Remove all found keys
		keysToRemove.forEach((key) => sessionStorage.removeItem(key));
	}

	// Utility function to clean up all map-related storage (for complete cleanup)
	clearAll(): void {
		const keysToRemove: string[] = [];

		// Find all keys that match our patterns
		for (let i = 0; i < sessionStorage.length; i++) {
			const key = sessionStorage.key(i);
			if (
				key &&
				(key === this.defaultGeoJsonKey ||
					key === this.defaultColorKey ||
					key === this.defaultCenterKey ||
					key.includes('_geoJson') ||
					key.includes('_color') ||
					key.includes('_center'))
			) {
				keysToRemove.push(key);
			}
		}

		// Remove all found keys
		keysToRemove.forEach((key) => sessionStorage.removeItem(key));
	}
}

const useMapLocalStorage = new MapLocalStorage([]);
export default useMapLocalStorage;
