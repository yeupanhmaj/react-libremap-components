import type { MapGeoJSONFeature } from 'maplibre-gl';
import {
	createContext,
	useCallback,
	useContext,
	useEffect,
	useMemo,
	useRef,
	useState,
	type CSSProperties,
	type ReactNode,
} from 'react';
import useMap from '../hooks/useMap';

// ─── Public types ──────────────────────────────────────────────────────────────

/**
 * Context object passed to every `getItems()` call and to each item's
 * `onClick` handler.  Carries the full right-click context so items can act on
 * map coordinates, queried features, and close the menu when done.
 */
export interface MapContextMenuClickContext {
	/** Map longitude at the right-clicked point */
	longitude: number;
	/** Map latitude at the right-clicked point */
	latitude: number;
	/** Viewport X (clientX) of the pointer */
	x: number;
	/** Viewport Y (clientY) of the pointer */
	y: number;
	/** Features found under the cursor for all `queryLayers` registered across all hooks */
	features: MapGeoJSONFeature[];
	/** Programmatically close the context menu */
	closeMenu: () => void;
}

/**
 * A single row in the shared context menu.
 *
 * - Providing `onClick` renders a clickable `<button>` row.
 * - Omitting `onClick` renders a static container, useful for embedded widgets
 *   such as colour pickers or sliders.
 */
export interface MapContextMenuItem {
	/** Content rendered inside the row — a plain string or any ReactNode. */
	content: ReactNode;
	/** Optional stable React key. Falls back to the array index when omitted. */
	itemKey?: string | number;
	/** When provided the row is rendered as a clickable button. */
	onClick?: (ctx: MapContextMenuClickContext) => void;
	/** Render a thin separator line above this item. */
	divider?: boolean;
	/** Visually disable a button item — `onClick` will not fire. */
	disabled?: boolean;
}

// ─── Internal registration type ───────────────────────────────────────────────

/**
 * Internal representation of a single `useMapContextMenu` registration.
 * Stable wrapper functions read from refs so closures never become stale.
 */
export interface ContextMenuRegistration {
	/** Always calls the latest `getItems` closure via a ref. */
	getItems: (ctx: MapContextMenuClickContext) => MapContextMenuItem[];
	/** Always returns the latest `queryLayers` array via a ref. */
	getQueryLayers: () => string[];
	/** Items from higher-priority registrations appear first. */
	priority: number;
}

// ─── Context type ──────────────────────────────────────────────────────────────

export interface MapContextMenuContextType {
	/** Register a menu-item provider.  Called by `useMapContextMenu` on mount. */
	register: (id: string, reg: ContextMenuRegistration) => void;
	/** Unregister a menu-item provider.  Called by `useMapContextMenu` on unmount. */
	unregister: (id: string) => void;
	/** `true` while the context menu is visible. */
	isOpen: boolean;
	/** Programmatically close the context menu. */
	close: () => void;
}

// ─── Default context value (no-op when no provider is present) ────────────────

const MapContextMenuContext = createContext<MapContextMenuContextType>({
	register: () => {
		// Intentional no-op: warns the developer that the provider is missing.
		// Using a string throw would hide the actual component name in the stack
		// trace, so we use a silent no-op here and document the requirement in
		// JSDoc instead.  Components will simply not display a context menu.
	},
	unregister: () => {},
	isOpen: false,
	close: () => {},
});

// ─── Shared menu styles ────────────────────────────────────────────────────────

const MENU_STYLE: CSSProperties = {
	position: 'fixed',
	fontFamily: 'system-ui, -apple-system, BlinkMacSystemFont, "Segoe UI", sans-serif',
	fontSize: 13,
	lineHeight: 1.5,
	zIndex: 9999,
	background: '#ffffff',
	border: '1px solid #e5e7eb',
	borderRadius: 8,
	boxShadow: '0 8px 24px rgba(0,0,0,0.12)',
	minWidth: 196,
	overflow: 'hidden',
};

// ─── Internal menu state ───────────────────────────────────────────────────────

interface MenuState {
	x: number;
	y: number;
	longitude: number;
	latitude: number;
	features: MapGeoJSONFeature[];
}

// ─── Provider ──────────────────────────────────────────────────────────────────

export interface MapContextMenuProviderProps {
	children: ReactNode;
	/**
	 * Id of the MapLibre map instance to attach the context-menu listener to.
	 * Defaults to the first registered map when omitted.
	 */
	mapId?: string;
}

/**
 * `MapContextMenuProvider` manages a **single** shared right-click context menu
 * for a MapLibre map.
 *
 * Any number of child components can contribute items via `useMapContextMenu`.
 * On right-click the provider collects items from all registered hooks, merges
 * them by `priority` order, and renders one combined menu — regardless of how
 * many components have called `useMapContextMenu`.
 *
 * ### Setup
 * Place this provider inside `<MapComponentsProvider>`, wrapping all map
 * components that should contribute to the same context menu:
 *
 * ```tsx
 * <MapComponentsProvider>
 *   <MapContextMenuProvider mapId="map_1">
 *     <MapLibreMap mapId="map_1" ... />
 *     <MlMarker ... />
 *     <MyCustomLayer ... />
 *   </MapContextMenuProvider>
 * </MapComponentsProvider>
 * ```
 *
 * ### Multi-map
 * For multiple maps, nest a separate `<MapContextMenuProvider mapId="…">` for
 * each map and keep the relevant components inside the matching provider.
 */
const MapContextMenuProvider = ({ children, mapId }: MapContextMenuProviderProps) => {
	const mapHook = useMap({ mapId });
	const [menuState, setMenuState] = useState<MenuState | null>(null);

	// Registry keyed by the stable id generated in each useMapContextMenu call.
	const registryRef = useRef<Map<string, ContextMenuRegistration>>(new Map());

	// Bumping this triggers a re-render so the menu always reflects the current
	// set of registered items on the current render cycle.
	const [, bump] = useState(0);

	const close = useCallback(() => setMenuState(null), []);

	const register = useCallback((id: string, reg: ContextMenuRegistration) => {
		registryRef.current.set(id, reg);
		bump((n) => n + 1);
	}, []);

	const unregister = useCallback((id: string) => {
		registryRef.current.delete(id);
		bump((n) => n + 1);
	}, []);

	// ── Close menu when the user clicks anywhere outside it ──────────────────
	useEffect(() => {
		if (!menuState) return;
		const handler = () => close();
		document.addEventListener('click', handler);
		return () => document.removeEventListener('click', handler);
	}, [menuState, close]);

	// ── Attach a SINGLE contextmenu listener to the map ──────────────────────
	useEffect(() => {
		if (!mapHook.map) return;

		const onContextMenu = (e: any) => {
			e.originalEvent?.preventDefault();

			// Union all queryLayers from every registered hook (deduplicated).
			const allLayers = [
				...new Set([...registryRef.current.values()].flatMap((r) => r.getQueryLayers())),
			];

			const features: MapGeoJSONFeature[] =
				allLayers.length > 0
					? (mapHook.map?.map.queryRenderedFeatures(e.point, { layers: allLayers }) ?? [])
					: [];

			setMenuState({
				x: e.originalEvent.clientX,
				y: e.originalEvent.clientY,
				longitude: e.lngLat.lng,
				latitude: e.lngLat.lat,
				features,
			});
		};

		mapHook.map.map.on('contextmenu', onContextMenu);
		return () => {
			mapHook.map?.map.off('contextmenu', onContextMenu);
		};
	}, [mapHook.map]);

	// ── Stable context value ──────────────────────────────────────────────────
	const contextValue = useMemo(
		() => ({ register, unregister, isOpen: !!menuState, close }),
		[register, unregister, menuState, close]
	);

	// ── Build the single combined menu (runs on every render) ─────────────────
	//
	// Computed inline — not inside a useMemo — so that the latest `getItems`
	// closures captured in each hook's ref are always used on the current render.
	let menuNode: ReactNode = null;

	if (menuState) {
		const ctx: MapContextMenuClickContext = { ...menuState, closeMenu: close };

		// Sort descending by priority; Map preserves insertion order for ties.
		const sortedRegs = [...registryRef.current.entries()].sort(
			([, a], [, b]) => b.priority - a.priority
		);

		const allItems = sortedRegs.flatMap(([, reg]) => reg.getItems(ctx));

		if (allItems.length > 0) {
			menuNode = (
				<div
					style={{ ...MENU_STYLE, top: menuState.y, left: menuState.x }}
					role="menu"
					// Stop clicks inside the menu from reaching the outside-click handler.
					onClick={(e) => e.stopPropagation()}
					onKeyDown={(e) => e.stopPropagation()}
				>
					{allItems.map((item, i) => {
						const key = item.itemKey ?? i;

						if (item.onClick) {
							return (
								<button
									key={key}
									type="button"
									role="menuitem"
									disabled={item.disabled}
									onClick={() => {
										if (!item.disabled) {
											item.onClick?.(ctx);
											close();
										}
									}}
									style={{
										display: 'flex',
										alignItems: 'center',
										gap: 8,
										width: '100%',
										padding: '9px 14px',
										background: 'none',
										border: 'none',
										borderTop: item.divider ? '1px solid #f3f4f6' : 'none',
										textAlign: 'left',
										cursor: item.disabled ? 'default' : 'pointer',
										fontSize: 'inherit',
										fontFamily: 'inherit',
										color: item.disabled ? '#9ca3af' : '#111827',
									}}
									onMouseEnter={(e) => {
										if (!item.disabled)
											(e.currentTarget as HTMLElement).style.background = '#f3f4f6';
									}}
									onMouseLeave={(e) => {
										(e.currentTarget as HTMLElement).style.background = 'none';
									}}
								>
									{item.content}
								</button>
							);
						}

						// Static / widget row
						return (
							<div
								key={key}
								style={{
									padding: '6px 14px',
									...(item.divider ? { borderTop: '1px solid #f3f4f6' } : {}),
								}}
							>
								{item.content}
							</div>
						);
					})}
				</div>
			);
		}
	}

	return (
		<MapContextMenuContext.Provider value={contextValue}>
			{children}
			{menuNode}
		</MapContextMenuContext.Provider>
	);
};

export { MapContextMenuProvider, MapContextMenuContext };

/** Convenience hook to access the `MapContextMenuContext` value directly. */
export const useMapContextMenuContext = () => useContext(MapContextMenuContext);
