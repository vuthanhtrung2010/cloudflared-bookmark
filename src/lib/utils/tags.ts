import type { TagType } from '$lib/types.js';

export function getTagPath(tagId: number, tagsMap: Record<number, TagType>): string {
	const tag = tagsMap[tagId];
	if (!tag) return '';

	if (tag.parent === 0) {
		return tag.title;
	}

	const parentPath = getTagPath(tag.parent, tagsMap);
	return parentPath ? `${parentPath} / ${tag.title}` : tag.title;
}

export function getDescendantIds(tagId: number, tagsMap: Record<number, TagType>): number[] {
	const descendants: number[] = [];
	const kids = Object.values(tagsMap).filter((t) => t.parent === tagId);

	for (const kid of kids) {
		descendants.push(kid.id);
		descendants.push(...getDescendantIds(kid.id, tagsMap));
	}

	return descendants;
}

export function sortTagsAlphabetically(
	tags: TagType[],
	tagsMap: Record<number, TagType>
): TagType[] {
	return [...tags].sort((a, b) => {
		const pathA = getTagPath(a.id, tagsMap);
		const pathB = getTagPath(b.id, tagsMap);
		return pathA.localeCompare(pathB);
	});
}
