// Tag color utilities matching Faved's colorMap
export const colorMap: Record<string, string> = {
	gray: 'bg-gray-600',
	green: 'bg-green-600',
	red: 'bg-red-600',
	yellow: 'bg-yellow-600',
	aqua: 'bg-blue-600',
	white: 'bg-neutral-300',
	black: 'bg-neutral-950'
};

export const colorOptions = Object.keys(colorMap);

export function getColorClass(color: string | undefined): string {
	if (!color) return colorMap.gray;
	return colorMap[color as keyof typeof colorMap] || colorMap.gray;
}
