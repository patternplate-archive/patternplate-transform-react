import traverse from 'babel-traverse';

/**
 * Get all export statements
 * @param  {Object} ast to search in
 * @return {Array}      ast nodes of export declarations
 */
export default function getExports(ast) {
	const imports = [];

	traverse(ast, {
		ExportDeclaration(path) {
			imports.push(path.node);
		}
	});
	return imports;
}
