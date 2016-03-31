import traverse from 'babel-traverse';
import {identifier, stringLiteral} from 'babel-types';
import importTemplate from './import-template';

/**
 * inject dependency imports into ast
 * @param  {Object} ast          babel ast
 * @param  {Object} dependencies importedName localName map
 * @return {Object}              babel ast with injected imports
 */
export default function injectImplicitDependencies(ast, dependencies) {
	const imports = Object.entries(dependencies)
		.map(item => {
			const [localName, importedName] = item;
			const name = importedName === 'pattern' ?
				'Pattern' :
				importedName;

			return importTemplate({
				LOCAL: identifier(localName),
				IMPORTED: stringLiteral(name)
			});
		});

	traverse(ast, {
		Program: {
			exit(path) {
				path.unshiftContainer('body', imports);
			}
		}
	});

	return ast;
}
