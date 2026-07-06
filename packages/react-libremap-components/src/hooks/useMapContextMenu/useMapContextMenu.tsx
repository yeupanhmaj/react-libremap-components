import { useContext, useEffect, useRef, type ReactNode } from 'react';
import {
	MapContextMenuContext,
	type ContextMenuRegistration,
	type MapContextMenuClickContext,
	type MapContextMenuItem,
} from '../../contexts/MapContextMenuContext';

// Re-export types from the context so existing imports of these types from this
// file continue to work without changes.
export type { MapContextMenuClickContext, MapContextMenuItem };

export interface UseMapContextMenuOptions {
	/**
	 * @deprecated `mapId` is no longer used by the hook — the `MapContextMenuProvider`
	 * you place in the tree controls which map the listener is attached to.
	 * The prop is kept for backwards-compatibility and will be removed in a future version.
	 */
	mapId?: string;
	/**
	 * Layer ids whose features are queried when the user right-clicks.
	 * The matching features are available on `ctx.features` inside `getItems`.
	 * All `queryLayers` across every registered hook are unioned into a single
	 * `queryRenderedFeatures` call by the provider.
	 */
	queryLayers?: string[];
	/**
	 * Called during every render while the menu is open.
	 * Return the list of items to display for this component.
	 * Closures over React state are safe — the function is always called with
	 * the latest render's closure values via an internal ref.
	 */
	getItems: (ctx: MapContextMenuClickContext) => MapContextMenuItem[];
	/**
	 * Items from higher-priority registrations appear first in the merged menu.
	 * Registrations with the same priority appear in mount order.
	 * @default 0
	 */
	priority?: number;
}

export interface UseMapContextMenuResult {
	/**
	 * @deprecated With `MapContextMenuProvider` the menu is rendered by the
	 * provider itself.  This value is always `null`.
	 * Kept for backwards compatibility — you can safely remove `{menuNode}` from
	 * your JSX.
	 */
	menuNode: ReactNode;
	/** `true` while the context menu is visible. */
	isOpen: boolean;
	/** Programmatically close the menu. */
	close: () => void;
}

/**
 * `useMapContextMenu` registers menu items into the nearest
 * `<MapContextMenuProvider>`.
 *
 * Multiple components can call this hook independently; all items are merged
 * into a **single** right-click menu rendered by the provider.
 *
 * @example
 * ```tsx
 * // 1. Wrap your map components once:
 * <MapComponentsProvider>
 *   <MapContextMenuProvider mapId="map_1">
 *     <MapLibreMap mapId="map_1" ... />
 *     <ComponentA />
 *     <ComponentB />
 *   </MapContextMenuProvider>
 * </MapComponentsProvider>
 *
 * // 2. Inside any component — items are merged automatically:
 * useMapContextMenu({
 *   getItems: ({ longitude, latitude }) => [
 *     {
 *       content: '📋 Copy coordinates',
 *       onClick: () => navigator.clipboard.writeText(`${latitude}, ${longitude}`),
 *     },
 *   ],
 * });
 * ```
 */
function useMapContextMenu({
	queryLayers,
	getItems,
	priority = 0,
}: UseMapContextMenuOptions): UseMapContextMenuResult {
	const { register, unregister, isOpen, close } = useContext(MapContextMenuContext);

	// Stable ID for this registration — generated once per hook instance.
	const idRef = useRef<string>(
		typeof crypto !== 'undefined' ? crypto.randomUUID() : Math.random().toString(36).slice(2)
	);

	// Keep refs up-to-date so the stable wrapper functions always invoke the
	// latest closures without needing to re-register on every render.
	const getItemsRef = useRef(getItems);
	getItemsRef.current = getItems;

	const queryLayersRef = useRef<string[]>(queryLayers ?? []);
	queryLayersRef.current = queryLayers ?? [];

	useEffect(() => {
		const id = idRef.current;

		const registration: ContextMenuRegistration = {
			// Stable wrappers — always call the current ref values.
			getItems: (ctx) => getItemsRef.current(ctx),
			getQueryLayers: () => queryLayersRef.current,
			priority,
		};

		register(id, registration);
		return () => unregister(id);

		// Re-register only when `priority` changes or the registry functions are
		// replaced (they are stable by design — memoised with useCallback).
		// `getItems` and `queryLayers` are handled via refs so they are always
		// fresh without appearing in this dep array.
		// eslint-disable-next-line react-hooks/exhaustive-deps
	}, [register, unregister, priority]);

	// menuNode is null — the provider renders the menu.
	// Kept in the return value so existing destructuring (`const { menuNode } = ...`)
	// does not break at compile time.
	return { menuNode: null, isOpen, close };
}

export default useMapContextMenu;
