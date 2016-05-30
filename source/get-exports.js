import traverse from 'babel-traverse';

/**
 * Get all export statements
 * @param  {Object} ast to search in
 * @return {Array}      ast nodes of export declarations
 */
export default ast => {
	const imports = [];

	traverse(ast, {
		ExportDeclaration(path) {
			imports.push(path.node);
		}
	});
	return imports;
};

module.change_code = 1; // eslint-disable-line
