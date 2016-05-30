const outerMostScopeTypes = ['Program', 'File'];
const jsxTypes = ['JSXElement', 'JSXAttribute', 'JSXExpression'];

/**
 * Check if an ast node is in the outermost scope of a program or file
 * @param  {Object}  node babylon ast node to check the scope for
 * @return {Boolean}      if node is in the outermost scope
 */
export default path => {
	const scope = path.scope || {};
	const parentBlock = scope.parentBlock || {};
	const scopType = parentBlock.type || '';

	const parent = path.parent || {};
	const parentType = parent.type || '';

	return outerMostScopeTypes.includes(scopType) &&
		jsxTypes.indexOf(parentType) === -1;
};

module.change_code = 1; // eslint-disable-line
