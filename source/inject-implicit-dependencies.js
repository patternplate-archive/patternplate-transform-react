import traverse from 'babel-traverse';
import createImport from './create-import';

/**
 * inject dependency imports into ast
 * @param  {Object} ast          babel ast
 * @param  {Object} dependencies importedName localName map
 * @return {Object}              babel ast with injected imports
 */
export default (ast, dependencies) => {
	const imports = Object.entries(dependencies)
		.map(item => {
			const [specifier, importedName] = item;
			const source = importedName === 'pattern' ?
				'Pattern' :
				importedName;

			return createImport(specifier, source);
		});

	traverse(ast, {
		Program: {
			exit(path) {
				path.unshiftContainer('body', imports);
			}
		}
	});

	return ast;
};

module.change_code = 1; // eslint-disable-line
