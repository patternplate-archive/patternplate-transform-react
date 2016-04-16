import traverse from 'babel-traverse';

import {
	identifier,
	stringLiteral
} from 'babel-types';

import importTemplate from './import-template';
import getImports from './get-imports';

export default function injectReactImport(ast) {
	const {identifiers} = getImports(ast);

	// Add React to imports if not imported already
	if (identifiers.includes('react') === false) {
		traverse(ast, {
			Program: {
				exit(path) {
					path.unshiftContainer('body', [
						importTemplate({
							LOCAL: identifier('React'),
							IMPORTED: stringLiteral('react')
						})
					]);
				}
			}
		});
	}
}

module.change_code = 1; // eslint-disable-line
