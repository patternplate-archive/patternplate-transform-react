import traverse from 'babel-traverse';
/**
 * @typedef Imports
 * @type Object
 * @property {Array}  an Array of the paths belonging to
						import statements / require calls
 * @property {Array}  an Array of the imported names
 */

/**
 * Get all require calls and import statements
 * @param  {Object}   ast to search in
 * @return {Imports}  The import paths and their names
 */
export default ast => {
	const imports = [];
	const identifiers = [];

	traverse(ast, {
		ImportDeclaration(path) {
			imports.push(path.node);
			identifiers.push(path.node.source.value);
		},
		CallExpression(path) {
			if (path.node.callee.name === 'require') {
				if (path.parent.type === 'VariableDeclarator') {
					imports.push(path.parentPath.parent);
				} else {
					imports.push(path.parent);
				}
				identifiers.push(path.node.arguments[0]);
			}
		}
	});

	return {imports, identifiers};
};

module.change_code = 1; // eslint-disable-line
