export default function normalizeTagName(tagName) {
	return tagName.toUpperCase() === tagName ?
		tagName.toLowerCase() :
		tagName;
}

module.change_code = 1; // eslint-disable-line
