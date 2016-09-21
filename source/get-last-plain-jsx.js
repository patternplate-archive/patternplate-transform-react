import getPlainJSX from './get-plain-jsx';

/**
 * Get the last JSX expression in the outermost scope
 * @param {Object}        ast to search in
 * @return {Object|null}  Expression node or null
 */
export default ast => {
	const plainJSX = getPlainJSX(ast);

	return plainJSX.length > 0 ?
		plainJSX[plainJSX.length - 1] :
		null;
};


