// Unified hex color presets - used everywhere for consistency
export const colorPresets = [
	'#ef4444',
	'#f97316',
	'#f59e0b',
	'#eab308',
	'#84cc16',
	'#22c55e',
	'#14b8a6',
	'#06b6d4',
	'#0ea5e9',
	'#3b82f6',
	'#6366f1',
	'#8b5cf6',
	'#a855f7',
	'#d946ef',
	'#ec4899',
	'#f43f5e',
	'#78716c',
	'#64748b'
];

// Legacy named color map (for backwards compatibility)
const legacyColorMap: Record<string, string> = {
	gray: '#64748b',
	green: '#22c55e',
	red: '#ef4444',
	yellow: '#eab308',
	aqua: '#06b6d4',
	white: '#d4d4d4',
	black: '#0a0a0a'
};

// Legacy export for backwards compatibility
export const colorOptions = Object.keys(legacyColorMap);

// Check if color is a hex color
export function isHexColor(color: string | undefined): boolean {
	if (!color) return false;
	return color.startsWith('#');
}

// Get Tailwind class for legacy named colors (returns empty string for hex colors)
export function getColorClass(color: string | undefined): string {
	// We now use inline styles everywhere, so just return empty
	return '';
}

// Get the actual hex color value
export function getColorValue(color: string | undefined): string {
	if (!color) return '#64748b'; // default gray
	// If it's already a hex color, return it
	if (isHexColor(color)) return color;
	// Map legacy named colors to hex
	return legacyColorMap[color] || '#64748b';
}
