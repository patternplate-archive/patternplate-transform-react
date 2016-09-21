export default tagName => {
	return tagName.toUpperCase() === tagName ?
		tagName.toLowerCase() :
		tagName;
};


