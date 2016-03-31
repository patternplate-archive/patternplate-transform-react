export default function normalizeTagName(tagName) {
	return tagName.toUpperCase() === tagName ?
		tagName.toLowerCase() :
		tagName;
}
