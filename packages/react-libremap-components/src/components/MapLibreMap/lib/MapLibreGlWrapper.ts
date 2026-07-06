/* eslint-disable @typescript-eslint/ban-ts-comment */
import type {
	ControlPosition,
	CustomLayerInterface,
	IControl,
	LayerSpecification,
	MapEventType,
	MapLayerEventType,
	MapOptions as MapOptionsType,
	Map as MapType,
	SourceSpecification,
	Style,
	StyleImageInterface,
	StyleImageMetadata,
} from 'maplibre-gl';

// biome-ignore lint/suspicious/noShadowRestrictedNames: class name is required to be MapLibreGlWrapper for the export
import { Map } from 'maplibre-gl';

type WrapperEventArgArray = [MapLibreGlWrapperEventName, MapLibreGlWrapperEventHandlerType];
type EventArgArray = [
	keyof MapLayerEventType | keyof MapEventType,
	string | ((arg0: unknown) => void),
	((arg0: unknown) => void)?,
];
type LayerState = {
	id: string;
	type: string;
	visible: boolean;
	baseLayer: boolean;
};
type ViewportState = {
	center: { lng: number; lat: number };
	zoom: number;
	bearing: number;
	pitch: number;
};

/**
 * Creates a MapLibre-gl-js instance and offers all of the native MapLibre functions and properties as well as additional functionality such as element registration & cleanup and more events.
 *
 * @param {object} props
 *
 * @class
 */

// @ts-expect-error
interface IMapLibreGlWrapper extends MapType {
	addImage: (
		id: string,
		image:
			| HTMLImageElement
			| ImageBitmap
			| ImageData
			| {
					width: number;
					height: number;
					data: Uint8Array | Uint8ClampedArray;
			  }
			| StyleImageInterface,
		key?: Partial<StyleImageMetadata> | string | undefined,
		componentId?: string | undefined
	) => this;
	addLayer: (
		layer:
			| (LayerSpecification & {
					source?: string | SourceSpecification | undefined;
			  })
			| (CustomLayerInterface & {
					source?: string | SourceSpecification | undefined;
			  }),
		beforeId?: string | undefined,
		componentId?: string | undefined
	) => this;
	cancelled: boolean;
}

interface MapLibreGlWrapperEventHandlers {
	layerchange: {
		handler: (ev: unknown) => void;
		options?: object | string;
	}[];
	viewportchange: {
		handler: (ev: unknown) => void;
		options?: object | string;
	}[];
	addsource: {
		handler: (
			ev: unknown,
			wrapper?: IMapLibreGlWrapper,
			data?: { [source_id: string]: string }
		) => void;
	}[];
	addlayer: {
		handler: (ev: unknown) => void;
		options?: object | string;
	}[];
}

export type MapLibreGlWrapperEventHandlerType =
	| MapLibreGlWrapperEventHandlers['layerchange'][number]['handler']
	| MapLibreGlWrapperEventHandlers['viewportchange'][number]['handler']
	| MapLibreGlWrapperEventHandlers['addsource'][number]['handler']
	| MapLibreGlWrapperEventHandlers['addlayer'][number]['handler'];

export type MapLibreGlEventName = keyof MapLayerEventType | keyof MapEventType | string;

export type MapLibreGlWrapperEventName = keyof MapLibreGlWrapperEventHandlers;

// biome-ignore lint/suspicious/noUnsafeDeclarationMerging: intentional – the interface merges MapType onto the class so TypeScript recognises the MapLibre methods that are copied to `this` at runtime by addNativeMaplibreFunctionsAndProps(). The class itself does not extend Map.
class IMapLibreGlWrapper {
	[key: string]: any;
	registeredElements: {
		[key: string]: {
			layers: [string?];
			sources: [string?];
			images: [string?];
			controls: [(IControl | unknown)?];
			events: [EventArgArray?];
			wrapperEvents: [WrapperEventArgArray?];
		};
	};
	baseLayers: [string?];
	firstSymbolLayer: string | undefined;
	eventHandlers: MapLibreGlWrapperEventHandlers;
	wrapper: {
		on: (
			eventName: MapLibreGlWrapperEventName,
			handler: MapLibreGlWrapperEventHandlerType,
			options?: object | string,
			componentId?: string
		) => void;
		off: (type: string, handler: MapLibreGlWrapperEventHandlerType) => void;
		fire: (eventName: string, context?: unknown) => void;
		layerState: LayerState[];
		layerStateString: string;
		oldLayerStateStrings: object;
		buildLayerObject: (layer: ReturnType<Style['getLayer']>) => LayerState | undefined;
		buildLayerObjects: () => LayerState[];
		refreshLayerState: () => void;
		viewportState: ViewportState;
		viewportStateString: string;
		oldViewportStateString: string;
		getViewport: () => {
			center: { lng: number; lat: number };
			zoom: number;
			bearing: number;
			pitch: number;
		};
		refreshViewport: () => void;
	};
	initRegisteredElements: (componentId: string, force?: boolean | undefined) => void;
	addNativeMaplibreFunctionsAndProps: () => void;
	// @ts-expect-error
	map: MapType;
	// @ts-expect-error
	style: Style;

	// @ts-expect-error
	styleJson: object;
	addSource: (id: string, source: SourceSpecification, componentId?: string | undefined) => this;
	/**
	 * Overrides MapLibre-gl-js addControl function providing an additional componentId parameter for the wrapper element registration.
	 *
	 * @param {object} control
	 * @param {string} position
	 * @param {string} componentId
	 */
	addControl: (
		control: IControl | unknown,
		position?: ControlPosition | undefined,
		componentId?: string | undefined
	) => this;
	on: (
		type: MapLibreGlEventName,
		layerId: string | ((ev: unknown) => void),
		handler?: ((ev: MapEventType & unknown) => Map | undefined | void) | string,
		componentId?: string | undefined
	) => this;
	cleanup: (componentId: string) => void;

	constructor(props: {
		mapOptions: MapOptionsType;
		onReady: (map: MapType, context: unknown) => void;
	}) {
		// element registration and cleanup on a component level is experimental
		this.registeredElements = {};

		// array of base layer ids, all layers that have been added by the style passed to the MapLibreGl coonstructor
		this.baseLayers = [];

		// layer id of the first symbol layer
		this.firstSymbolLayer = undefined;

		// event handlers registered in MapLibreGlWrapper
		this.eventHandlers = {
			layerchange: [],
			viewportchange: [],
			addsource: [],
			addlayer: [],
		};

		// functions and properties provided by the wrapper
		// Add new functions and properties introduced by the wrapper to this object to prevent collisions due to future MapLibre API changes
		this.wrapper = {
			/**
			 * Subscribe the given event handler to an event
			 *
			 * @param {string} eventName
			 * @param {function} handler
			 * @param {object} options
			 * @param {string} componentId
			 * @returns {undefined}
			 */
			on: (
				eventName: MapLibreGlWrapperEventName,
				handler: MapLibreGlWrapperEventHandlerType,
				options?: object | string,
				componentId?: string
			): undefined => {
				if (!this.eventHandlers[eventName]) return;

				if (typeof options === 'string') {
					componentId = options;
					options = {};
				}

				this.eventHandlers[eventName].push({ handler, options });

				const _arguments: WrapperEventArgArray = [eventName, handler];
				if (componentId && typeof componentId === 'string') {
					this.initRegisteredElements(componentId);
					this.registeredElements[componentId].wrapperEvents.push(_arguments);
				}
			},
			/**
			 * Unsubscribes the given event handler from an event
			 *
			 * @param {string} eventName
			 * @param {function} handler
			 * @returns {undefined}
			 */
			// @ts-expect-error
			off: (
				eventName: MapLibreGlWrapperEventName,
				handler: MapLibreGlWrapperEventHandlerType
			): undefined => {
				if (!this.eventHandlers[eventName]) return;

				this.eventHandlers[eventName] = this.eventHandlers[eventName].filter((item) => {
					if (!Object.is(item.handler, handler)) {
						return item;
					}
					return false;
				});
			},
			/**
			 * Calls all event handlers that have been subscribed to the given eventName
			 *
			 * @param {string} eventName
			 * @param {object} context
			 * @returns {undefined}
			 */
			// @ts-expect-error
			fire: (eventName: MapLibreGlWrapperEventName, context: any): undefined => {
				if (!this.eventHandlers[eventName]) return;

				const scope = context || window;
				const event = new Event(eventName);

				this.eventHandlers[eventName].forEach(
					(
						item:
							| IMapLibreGlWrapper['eventHandlers']['layerchange'][0]
							| IMapLibreGlWrapper['eventHandlers']['viewportchange'][0]
							| IMapLibreGlWrapper['eventHandlers']['addsource'][0]
							| IMapLibreGlWrapper['eventHandlers']['addlayer'][0]
					) => {
						item.handler.call(scope, event, this, context);
					}
				);
			},
			/**
			 * Array containing an object for each layer in the MapLibre instance providing information on visibility, loading state, order, paint & layout properties
			 */
			layerState: [],
			/**
			 * Maps layerIds to layerState in JSON string form for quick deep comparisons
			 */
			layerStateString: '',
			/**
			 * Previous Version of layerStateString
			 */
			oldLayerStateStrings: {},
			/**
			 * Builds the layer info object for a given layer id
			 *
			 * @param {string} layer
			 * @returns object
			 */
			buildLayerObject: (layer: ReturnType<Style['getLayer']>) => {
				//if (self.baseLayers.indexOf(layer.id) === -1) {
				//let paint = {};
				//let values = layer.paint?._values;
				//Object.keys(values || {}).map((propName) => {
				//	paint[propName] =
				//		typeof values[propName].value !== "undefined"
				//			? values[propName].value.value
				//			: values[propName];
				//});
				//let layout = {};
				//values = layer.layout?._values;
				//Object.keys(values || {}).map((propName) => {
				//	layout[propName] =
				//		typeof values[propName].value !== "undefined"
				//			? values[propName].value.value
				//			: values[propName];
				//});
				if (!layer) return;
				return {
					id: layer.id,
					type: layer.type,
					visible: layer.visibility !== 'none',
					baseLayer: this.baseLayers.indexOf(layer.id) !== -1,
					//paint,
					//layout,
					//filter: layers[layerId].filter,
					//layout: layers[layerId].layout,
					//maxzoom: layers[layerId].maxzoom,
					//metadata: layers[layerId].metadata,
					//minzoom: layers[layerId].minzoom,
					//paint: layers[layerId].paint.get(),
					//source: layers[layerId].source,
					//sourceLayer: layers[layerId].sourceLayer,
				};
				//}
			},
			/**
			 * Returns an array of layer state info objects for all layers in the MapLibre instance
			 *
			 * @returns array
			 */
			buildLayerObjects: () => {
				return this.map.style._order
					.map((layerId: string) => {
						return this.wrapper.buildLayerObject(this.map.style._layers[layerId]);
					})
					.filter((n) => typeof n !== 'undefined') as LayerState[];
			},
			/**
			 * Updates layer state info objects
			 */
			refreshLayerState: () => {
				this.wrapper.layerState = this.wrapper.buildLayerObjects();
				if (JSON.stringify(this.wrapper.layerState) !== this.wrapper.layerStateString) {
					this.wrapper.fire('layerchange');
					this.wrapper.layerStateString = JSON.stringify(this.wrapper.layerState);
				}
			},
			/**
			 * Object containing information on the current viewport state
			 */
			viewportState: {
				center: { lng: 0, lat: 0 },
				zoom: 0,
				bearing: 0,
				pitch: 0,
			},
			/**
			 * The same data as viewportState in JSON string form for quick deep comparisons
			 */
			viewportStateString: '{}',
			/**
			 * Previous version of viewportStateString
			 */
			oldViewportStateString: '{}',
			getViewport: () =>
				typeof this.map.getCenter === 'function'
					? {
							center: (({ lng, lat }) => ({ lng, lat }))(this.map.getCenter()),
							zoom: this.map.getZoom(),
							bearing: this.map.getBearing(),
							pitch: this.map.getPitch(),
						}
					: {
							center: { lng: 0, lat: 0 },
							zoom: 0,
							bearing: 0,
							pitch: 0,
						},
			refreshViewport: () => {
				this.wrapper.viewportState = this.wrapper.getViewport();
			},
		};

		this.cancelled = false;

		/**
		 * Initializes an empty registered elements object for the given componentId
		 *
		 * @param {string} componentId
		 * @param {boolean} force
		 */
		this.initRegisteredElements = (componentId: string, force?: boolean | undefined) => {
			if (
				typeof this.registeredElements[componentId] === 'undefined' ||
				(typeof force !== 'undefined' && force)
			) {
				this.registeredElements[componentId] = {
					layers: [],
					sources: [],
					images: [],
					events: [],
					controls: [],
					wrapperEvents: [],
				};
			}
		};

		/**
		 * Overrides MapLibre-gl-js addLayer function providing an additional componentId parameter for the wrapper element registration.
		 *
		 * @param {object} layer
		 * @param {string} beforeId
		 * @param {string} componentId
		 */
		this.addLayer = (
			layer: (LayerSpecification | CustomLayerInterface) & {
				source?: string | SourceSpecification;
			},
			beforeId?: string,
			componentId?: string
		) => {
			if (!this.map.style) {
				return this;
			}
			if (componentId && typeof componentId === 'string' && typeof layer.id !== 'undefined') {
				this.initRegisteredElements(componentId);
				this.registeredElements[componentId].layers.push(layer.id);

				if (layer?.source && typeof layer?.source !== 'string') {
					this.registeredElements[componentId].sources.push(layer.id);
				}
			}

			this.map.addLayer(layer as LayerSpecification, beforeId);
			this.wrapper.fire('addlayer', { layer_id: layer.id });
			return this;
		};

		/**
		 * Overrides MapLibre-gl-js addSource function providing an additional componentId parameter for the wrapper element registration.
		 * @param {string} sourceId
		 * @param {object} source
		 * @param {string} componentId
		 * @returns {undefined}
		 */
		this.addSource = (
			sourceId: string,
			source: SourceSpecification,
			componentId?: string
		): this => {
			if (!this.map.style) {
				return this;
			}
			if (componentId && typeof componentId === 'string' && typeof sourceId !== 'undefined') {
				this.initRegisteredElements(componentId);
				this.registeredElements[componentId].sources.push(sourceId);
			}

			this.map.addSource(sourceId, source);
			this.wrapper.fire('addsource', { source_id: sourceId });
			return this;
		};

		/**
		 * Overrides MapLibre-gl-js addImage function providing an additional componentId parameter for the wrapper element registration.
		 *
		 * @param {string} id
		 * @param {*} image
		 * @param {*} ref
		 * @param {string} componentId
		 */
		this.addImage = (id, image, meta, componentId) => {
			if (!this.map.style) {
				return this;
			}
			if (typeof meta === 'string' && typeof componentId === 'undefined') {
				return this.addImage(id, image, undefined, meta);
			}
			if (componentId && typeof componentId === 'string' && typeof id !== 'undefined') {
				this.initRegisteredElements(componentId);
				this.registeredElements[componentId].images.push(id);
			}

			this.map.addImage(id, image, meta as Partial<StyleImageMetadata> | undefined);
			return this;
		};

		/**
		 * Overrides MapLibre-gl-js on function providing an additional componentId parameter for the wrapper element registration.
		 *
		 * @param {string} type
		 * @param {string} layerId
		 * @param {function} handler
		 * @param {string} componentId
		 */
		// @ts-expect-error
		this.on = (
			type: MapLibreGlEventName,
			layerId: string | ((ev: unknown) => void),
			handler: (ev: unknown) => void,
			componentId?: string
		) => {
			if (typeof handler === 'string' && typeof layerId === 'function') {
				// @ts-expect-error
				return this.on.call(this, type, undefined, layerId, handler);
			}

			let _arguments: EventArgArray = [type as EventArgArray[0], layerId, handler];
			if (!layerId) {
				_arguments = [type, handler] as EventArgArray;
			}

			if (componentId && typeof componentId === 'string') {
				this.initRegisteredElements(componentId);
				this.registeredElements[componentId].events.push(_arguments);
			}

			// @ts-expect-error
			this.map.on(..._arguments);
			return this;
		};

		/**
		 * Overrides MapLibre-gl-js addControl function providing an additional componentId parameter for the wrapper element registration.
		 *
		 * @param {object} control
		 * @param {string} position
		 * @param {string} componentId
		 */
		this.addControl = (control, position, componentId) => {
			if (componentId && typeof componentId === 'string') {
				this.initRegisteredElements(componentId);
				this.registeredElements[componentId].controls.push(control);
			}

			this.map.addControl(control as IControl, position);
			return this;
		};

		/**
		 * Removes anything that has been added to the maplibre instance referenced with componentId
		 *
		 * @param {string} componentId
		 */
		this.cleanup = (componentId: string) => {
			if (this.map.style && typeof this.registeredElements[componentId] !== 'undefined') {
				// cleanup layers
				// @ts-expect-error
				this.registeredElements[componentId].layers.forEach((item: string) => {
					if (this.map.style.getLayer(item)) {
						this.map.style.removeLayer(item);
					}
				});

				// cleanup sources
				// @ts-expect-error
				this.registeredElements[componentId].sources.forEach((item: string) => {
					if (this.map.style.getSource(item)) {
						this.map.style.removeSource(item);
					}
				});

				// cleanup images
				// @ts-expect-error
				this.registeredElements[componentId].images.forEach((item: string) => {
					if (this.map.hasImage(item)) {
						this.map.style.removeImage(item);
					}
				});

				// cleanup events
				// @ts-expect-error
				this.registeredElements[componentId].events.forEach((item: EventArgArray) => {
					// @ts-expect-error
					this.map.off(...item);
				});

				// cleanup controls
				this.registeredElements[componentId].controls.forEach((item: IControl | unknown) => {
					this.map.removeControl(item as IControl);
				});

				// cleanup wrapper events
				// @ts-expect-error
				this.registeredElements[componentId].wrapperEvents.forEach((item: WrapperEventArgArray) => {
					this.wrapper.off(...item);
				});

				this.initRegisteredElements(componentId, true);
			}
		};

		// add style prop functions that require map._update to be called afterwards
		const updatingStyleFunctions = [
			'moveLayer',
			'removeLayer',
			'removeSource',
			'setPaintProperty',
			'setLayoutProperty',
		];
		updatingStyleFunctions.forEach((item) => {
			this[item] = (...props: any[]) => {
				//@ts-expect-error
				if (this.map?.style && typeof this.map.style[item] === 'function') {
					//@ts-expect-error
					this.map.style[item](...props);
				}
				return this.map._update ? this.map._update(true) : undefined;
			};
		});

		// add style prop functions
		const styleFunctions = [
			'getLayer',
			'getSource',
			'listImages',
			'getPaintProperty',
			'getLayoutProperty',
			'removeImage',
		];
		styleFunctions.forEach((item) => {
			this[item] = (...props: any[]) => {
				if (this.map?.style) {
					//@ts-expect-error
					return this.map.style[item](...props);
				}
				return false;
			};
		});

		this.addNativeMaplibreFunctionsAndProps = () => {
			//	add MapLibre-gl functions
			Object.getOwnPropertyNames(Object.getPrototypeOf(this.map)).forEach((item) => {
				if (typeof this[item] === 'undefined') {
					//@ts-expect-error
					this[item] = (...props: any[]) => this.map[item](...props);
				}
			});

			//	add MapLibre-gl properties
			Object.keys(this.map).forEach((item) => {
				if (typeof this[item] === 'undefined') {
					//@ts-expect-error
					this[item] = this.map[item];
				}
			});
		};

		// add functions that are missing on the MapLibre instances prototype
		const missingFunctions = [
			'getZoom',
			'setZoom',
			'getCenter',
			'setCenter',
			'getBearing',
			'setBearing',
			'getPitch',
			'setPitch',
			'jumpTo',
			'flyTo',
			'panTo',
			'panBy',
			'panBy',
			'zoomTo',
			'zoomIn',
			'zoomOut',
			'getPadding',
			'setPadding',
			'rotateTo',
			'resetNorth',
			'resetNorthPitch',
			'snapToNorth',
			'cameraForBounds',
			'fitBounds',
			'fitScreenCoordinates',
			'getFreeCameraOptions',
			'setFreeCameraOptions',
			'easeTo',
			'stop',
		];
		missingFunctions.forEach((item) => {
			this[item] = (...props: any[]) => {
				//@ts-expect-error
				if (typeof this.map[item] === 'function') {
					//@ts-expect-error
					return this.map[item].call(this.map, ...props);
				}
				return undefined;
			};
		});

		// initialize the MapLibre-gl instance
		const initializeMapLibre = async () => {
			// if mapOptions style URL is given and if it is not a mapbox URL fetch the json and initialize the mapbox object
			if (
				typeof props.mapOptions.style === 'string' &&
				props.mapOptions.style.indexOf('mapbox://') === -1
			) {
				await fetch(props.mapOptions.style)
					.then((response) => {
						if (response.ok) {
							return response.json();
						} else {
							throw new Error('error loading map style.json');
						}
					})
					.then((styleJson) => {
						styleJson.layers.forEach((item: any) => {
							this.baseLayers.push(item.id);
							if (!this.firstSymbolLayer && item.type === 'symbol') {
								this.firstSymbolLayer = item.id;
							}
						});
						this.styleJson = styleJson;
						props.mapOptions.style = styleJson;
					})
					.catch((error) => {
						// biome-ignore lint/suspicious/noConsole: log style-fetch errors to the console
						console.error(error);
					});
			}

			this.map = new Map(props.mapOptions) as MapType;

			this.addNativeMaplibreFunctionsAndProps();
			this.wrapper.refreshViewport();
			this.wrapper.fire('viewportchange');

			this.map.on('load', () => {
				this.addNativeMaplibreFunctionsAndProps();
			});

			this.map.on('move', () => {
				this.wrapper.viewportState = this.wrapper.getViewport();
				this.wrapper.fire('viewportchange');
			});
			this.map.on('idle', () => {
				this.wrapper.refreshLayerState();
			});
			this.map.on('data', () => {
				this.wrapper.refreshLayerState();
			});
			if (typeof props.onReady === 'function') {
				props.onReady(this.map, this);
			}
		};
		initializeMapLibre();
	}
}
export default IMapLibreGlWrapper;

export type { LayerState, ViewportState };
