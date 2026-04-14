import L from 'leaflet';
import type {
	EagPointTrackingMapFeature,
	markerState,
	PointTrackList,
} from '../../types/tracking-map-display-interface';

export class PointLayer extends L.Layer {
	private map?: L.Map;
	private group = L.layerGroup();

	private markers = new Map<string, markerState>();
	private tracks = new Map<string, PointTrackList>();
	private defaultIconUrl: string = '/marker-icon.png';

	private running = false;
	private animationLoopId = 0;

	private minFrameMs = 1000 / 15;
	private lastFrameTimestamp = 0;

	private zooming = false;
	private _onZoomStart = () => {
		this.zooming = true;
		this.group.remove();
	};
	private _onZoomEnd = () => {
		this.zooming = false;
		if (this.map) this.group.addTo(this.map);
		this.lastFrameTimestamp = 0;
	};

	constructor(defaultIconUrl?: string) {
		super();
		if (defaultIconUrl) this.defaultIconUrl = defaultIconUrl;
	}

	onAdd(map: L.Map): this {
		this.map = map;
		this.group.addTo(map);
		map.on('zoomstart', this._onZoomStart);
		map.on('zoomend', this._onZoomEnd);
		return this;
	}

	onRemove(map: L.Map): this {
		this.stop();
		map.off('zoomstart', this._onZoomStart);
		map.off('zoomend', this._onZoomEnd);
		this.group.remove();
		this.map = undefined;
		return this;
	}

	setData(points: EagPointTrackingMapFeature[]) {
		this._groupTracks(points);
		this._updateMarkersFromTracks();
		this.start();
	}

	start() {
		if (this.running) return;
		this.running = true;
		this.lastFrameTimestamp = 0;
		this.animationLoopId = requestAnimationFrame(this._animateFrame);
	}

	stop() {
		this.running = false;
		if (this.animationLoopId) cancelAnimationFrame(this.animationLoopId);
		this.animationLoopId = 0;
	}

	// ================== GROUP TRACKS ==================

	private _groupTracks(points: EagPointTrackingMapFeature[]) {
		this.tracks.clear();

		for (const p of points) {
			const id = this._getId(p);
			if (!id) continue;

			let track = this.tracks.get(id);
			if (!track) {
				track = {
					id,
					positions: [],
					currentIndex: 0,
					easeOutNumber: 0,
					heading: p.properties?.heading ?? 0,
				} as PointTrackList;

				this.tracks.set(id, track);
			}

			track.positions.push(p);
		}
	}

	private _updateMarkersFromTracks() {
		if (!this.map) return;

		// Track active vehicle ids in the new data
		const activeVehicleIds = new Set<string>();

		for (const [vehicleId, track] of this.tracks) {
			const positions = track.positions;
			if (!positions.length) continue;

			activeVehicleIds.add(vehicleId);

			const firstPosition = positions[0];
			const [initialLng, initialLat] = firstPosition.geometry.coordinates;

			const { label, tooltipOptions } = this._buildTooltipConfig(vehicleId, firstPosition);

			let markerState = this.markers.get(vehicleId);

			if (!markerState) {
				// create new marker if not exist
				const leafletMarker = L.marker([initialLat, initialLng], {
					icon: this._createVehicleIcon(track.heading ?? 0),
					interactive: false,
					keyboard: false,
				}).addTo(this.group);

				// Bind tooltip once
				leafletMarker.bindTooltip(label, tooltipOptions);

				markerState = {
					marker: leafletMarker,
					lat: initialLat,
					lng: initialLng,
					heading: track.heading ?? 0,
					index: 0,
					progress: 0,
				};

				this.markers.set(vehicleId, markerState);
			} else {
				// Marker already exists → reset position
				markerState.lat = initialLat;
				markerState.lng = initialLng;
				markerState.marker.setLatLng([initialLat, initialLng]);

				this._updateMarkerTooltip(markerState.marker, label, tooltipOptions);
				this._updateMarkerHeading(markerState.marker, track.heading);

				// Ensure the marker's current segment index is valid for the new track
				if (positions.length >= 2)
					markerState.index = Math.min(markerState.index, positions.length - 2);
				else {
					markerState.index = 0;
					markerState.progress = 0;
				}
			}
		}

		// Remove markers that no longer exist
		for (const [vehicleId, markerState] of this.markers) {
			if (!activeVehicleIds.has(vehicleId)) {
				markerState.marker.remove();
				this.markers.delete(vehicleId);
			}
		}
	}

	private _createVehicleIcon(heading: number) {
		const w = 50;
		const h = 58;

		return L.divIcon({
			className: 'vehicle-marker',
			html: `<img class="vehicle-img" src="${this.defaultIconUrl}" style="width: ${w}px; height: ${h}px; transform: rotate(${heading}deg);" />`,
			iconSize: [w, h],
			iconAnchor: [w / 2, h],
		});
	}

	private _updateMarkerHeading(marker: L.Marker, heading?: number) {
		if (heading == null) return;

		const el = marker.getElement();
		if (!el) return;

		const img = el.querySelector<HTMLImageElement>('.vehicle-img');
		if (!img) return;

		const next = String(heading);

		img.style.transform = `rotate(${heading}deg)`;
		img.dataset.heading = next;
	}

	// ================== ANIMATION ==================

	private _ease(t: number) {
		return 1 - (1 - t) ** 3;
	}

	private _animateFrame = (timestamp: number) => {
		if (!this.running) return;

		if (this.zooming) {
			this.animationLoopId = requestAnimationFrame(this._animateFrame);
			return;
		}

		if (this.lastFrameTimestamp && timestamp - this.lastFrameTimestamp < this.minFrameMs) {
			this.animationLoopId = requestAnimationFrame(this._animateFrame);
			return;
		}

		const delta = this.lastFrameTimestamp ? timestamp - this.lastFrameTimestamp : 0;

		this.lastFrameTimestamp = timestamp;

		const speed = 0.0015;

		let hasAnyActiveTruck = false;

		for (const [vehicleId, track] of this.tracks) {
			const marker = this.markers.get(vehicleId);
			if (!marker) continue;

			const pts = track.positions;
			if (pts.length < 2) continue;

			const lastSegmentIndex = pts.length - 2;
			const lastPoint = pts[pts.length - 1];

			if (marker.index >= lastSegmentIndex) {
				marker.index = lastSegmentIndex;
				marker.progress = 1;

				const finalLng = lastPoint.geometry.coordinates[0];
				const finalLat = lastPoint.geometry.coordinates[1];

				if (marker.lat !== finalLat || marker.lng !== finalLng) {
					marker.lat = finalLat;
					marker.lng = finalLng;
					// update position
					marker.marker.setLatLng([finalLat, finalLng]);

					// update heading
					this._updateMarkerHeading(marker.marker, lastPoint.properties?.heading ?? track.heading);
				}

				continue;
			}

			hasAnyActiveTruck = true;

			marker.progress += delta * speed;

			if (marker.progress >= 1) {
				marker.progress = 0;
				marker.index++;

				if (marker.index >= lastSegmentIndex) {
					marker.index = lastSegmentIndex;
					marker.progress = 1;

					const finalLng = lastPoint.geometry.coordinates[0];
					const finalLat = lastPoint.geometry.coordinates[1];

					marker.lat = finalLat;
					marker.lng = finalLng;
					marker.marker.setLatLng([finalLat, finalLng]);

					// update heading
					this._updateMarkerHeading(marker.marker, lastPoint.properties?.heading ?? track.heading);

					continue;
				}
			}

			const first = pts[marker.index];
			const next = pts[marker.index + 1];

			const easeProgress = this._ease(marker.progress);

			const lng =
				first.geometry.coordinates[0] +
				(next.geometry.coordinates[0] - first.geometry.coordinates[0]) * easeProgress;
			const lat =
				first.geometry.coordinates[1] +
				(next.geometry.coordinates[1] - first.geometry.coordinates[1]) * easeProgress;
			marker.lat = lat;
			marker.lng = lng;
			marker.marker.setLatLng([lat, lng]);

			// update heading
			this._updateMarkerHeading(marker.marker, next.properties?.heading ?? track.heading);
		}

		if (!hasAnyActiveTruck) {
			this.stop();
			return;
		}

		this.animationLoopId = requestAnimationFrame(this._animateFrame);
	};

	// ================== HELPERS ==================

	private _getId(f: EagPointTrackingMapFeature): string | undefined {
		const raw = f.id ?? f.properties?.id;
		if (raw == null) return undefined;

		return String(raw).trim();
	}

	private _buildTooltipConfig(
		vehicleId: string,
		position: EagPointTrackingMapFeature
	): { label: string; tooltipOptions: L.TooltipOptions } {
		if (!this.map) {
			return {
				label: vehicleId,
				tooltipOptions: {},
			};
		}

		// Tooltip text
		const label =
			(position.properties?.title as string | undefined) ??
			(position.properties?.name as string | undefined) ??
			vehicleId;

		const tooltipOptions: L.TooltipOptions = {
			direction: 'right',
			offset: [16, 0], // 1rem ≈ 16px
			permanent: true,
			opacity: 0.95,
		};

		return { label, tooltipOptions };
	}

	private _updateMarkerTooltip(marker: L.Marker, label: string, options?: L.TooltipOptions) {
		const existing = marker.getTooltip();

		const fixedOptions: L.TooltipOptions = {
			...options,
			direction: 'right',
			offset: [16, 0], // 1rem ≈ 16px
			permanent: true,
			opacity: 0.95,
		};

		if (!existing) {
			marker.bindTooltip(label, fixedOptions);
			return;
		}

		if (existing.getContent() !== label) {
			existing.setContent(label);
		}
		existing.options.direction = 'right';
		existing.options.offset = [16, 0];

		existing.update();
	}
}
