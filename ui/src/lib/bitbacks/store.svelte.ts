import { BACKGROUND_REGISTRY, DEFAULT_BACKGROUND_ID, type BackgroundEntry } from './registry';

const STORAGE_KEY = 'besvelte:background_settings:v1';

export interface BackgroundSettings {
	enabled: boolean;
	activeId: string;
	opacity: number;
	sidebarOpacity?: number;
	props: Record<string, Record<string, any>>;
}

function loadSettings(): BackgroundSettings {
	if (typeof window === 'undefined') {
		return {
			enabled: true,
			activeId: DEFAULT_BACKGROUND_ID,
			opacity: 0.25,
			sidebarOpacity: 0.82,
			props: {}
		};
	}

	try {
		const raw = localStorage.getItem(STORAGE_KEY);
		if (raw) {
			const parsed = JSON.parse(raw);
			return {
				enabled: parsed.enabled ?? true,
				activeId: BACKGROUND_REGISTRY[parsed.activeId] ? parsed.activeId : DEFAULT_BACKGROUND_ID,
				opacity: typeof parsed.opacity === 'number' ? parsed.opacity : 0.25,
				sidebarOpacity: typeof parsed.sidebarOpacity === 'number' ? parsed.sidebarOpacity : 0.82,
				props: parsed.props ?? {}
			};
		}
	} catch {}

	return {
		enabled: true,
		activeId: DEFAULT_BACKGROUND_ID,
		opacity: 0.25,
		sidebarOpacity: 0.82,
		props: {}
	};
}

function hexToRgbTuple(hex: string): [number, number, number] {
	const m = /^#?([a-f\d]{2})([a-f\d]{2})([a-f\d]{2})$/i.exec(hex);
	if (!m) return [0.3, 0.69, 0.34];
	return [
		Math.round((parseInt(m[1], 16) / 255) * 100) / 100,
		Math.round((parseInt(m[2], 16) / 255) * 100) / 100,
		Math.round((parseInt(m[3], 16) / 255) * 100) / 100
	];
}

class BackgroundStore {
	enabled = $state(true);
	activeId = $state(DEFAULT_BACKGROUND_ID);
	opacity = $state(0.25);
	sidebarOpacity = $state(0.82);
	props = $state<Record<string, Record<string, any>>>({});
	isExpanded = $state(false);
	isControllerOpen = $state(false);

	constructor() {
		if (typeof window !== 'undefined') {
			const saved = loadSettings();
			this.enabled = saved.enabled;
			this.activeId = saved.activeId;
			this.opacity = saved.opacity;
			this.sidebarOpacity = saved.sidebarOpacity ?? 0.82;
			this.props = saved.props;
		}
	}

	private save() {
		if (typeof window === 'undefined') return;
		try {
			localStorage.setItem(
				STORAGE_KEY,
				JSON.stringify({
					enabled: this.enabled,
					activeId: this.activeId,
					opacity: this.opacity,
					sidebarOpacity: this.sidebarOpacity,
					props: this.props
				})
			);
		} catch {}
	}

	get activeEntry(): BackgroundEntry {
		return BACKGROUND_REGISTRY[this.activeId] || BACKGROUND_REGISTRY[DEFAULT_BACKGROUND_ID];
	}

	get currentProps(): Record<string, any> {
		const entry = this.activeEntry;
		const custom = this.props[this.activeId] || {};
		const raw = { ...entry.defaults, ...custom };
		const result: Record<string, any> = {};

		const arrays: Record<string, any[]> = {};

		for (const ctrl of entry.controls) {
			const val = raw[ctrl.key] ?? ctrl.default;

			if (ctrl.type === 'color' && ctrl.format === 'array' && ctrl.targetKey) {
				if (!arrays[ctrl.targetKey]) arrays[ctrl.targetKey] = [];
				const idx = ctrl.arrayIndex ?? 0;
				arrays[ctrl.targetKey][idx] = val;
				continue;
			}

			if (ctrl.type === 'color' && ctrl.format === 'rgbTuple' && typeof val === 'string') {
				result[ctrl.key] = hexToRgbTuple(val);
				continue;
			}

			result[ctrl.key] = val;
		}

		for (const [key, arr] of Object.entries(arrays)) {
			result[key] = arr;
		}

		return result;
	}

	setProp(key: string, value: any) {
		if (!this.props[this.activeId]) {
			this.props[this.activeId] = { ...this.activeEntry.defaults };
		}
		this.props[this.activeId][key] = value;
		this.save();
	}

	resetCurrentProps() {
		if (this.props[this.activeId]) {
			const copy = { ...this.props };
			delete copy[this.activeId];
			this.props = copy;
			this.save();
		}
	}

	setActiveBackground(id: string) {
		if (BACKGROUND_REGISTRY[id]) {
			this.activeId = id;
			this.save();
		}
	}

	setOpacity(val: number) {
		this.opacity = Math.max(0, Math.min(1, val));
		this.save();
	}

	setSidebarOpacity(val: number) {
		this.sidebarOpacity = Math.max(0, Math.min(1, val));
		this.save();
	}

	nextBackground() {
		const list = Object.values(BACKGROUND_REGISTRY).sort((a, b) => a.name.localeCompare(b.name));
		const idx = list.findIndex((b) => b.id === this.activeId);
		const nextIdx = (idx + 1) % list.length;
		this.setActiveBackground(list[nextIdx].id);
	}

	prevBackground() {
		const list = Object.values(BACKGROUND_REGISTRY).sort((a, b) => a.name.localeCompare(b.name));
		const idx = list.findIndex((b) => b.id === this.activeId);
		const prevIdx = (idx - 1 + list.length) % list.length;
		this.setActiveBackground(list[prevIdx].id);
	}

	toggleEnabled() {
		this.enabled = !this.enabled;
		this.save();
	}

	toggleExpanded() {
		this.isExpanded = !this.isExpanded;
	}

	toggleController() {
		this.isControllerOpen = !this.isControllerOpen;
	}

	openController() {
		this.isControllerOpen = true;
	}

	closeController() {
		this.isControllerOpen = false;
	}
}

export const bgState = new BackgroundStore();
