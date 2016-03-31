import React from 'react';

import {
	exportDefaultDeclaration,
	identifier,
	isExportDefaultDeclaration,
	stringLiteral
} from 'babel-types';
import traverse from 'babel-traverse';

import getAuxiliary from './get-auxiliary';
import getComponentTemplate from './get-component-template';
import getExports from './get-exports';
import getImports from './get-imports';
import getLastPlainJSX from './get-last-plain-jsx';
import importTemplate from './import-template';

/**
 * Create a React component definition from ast if needed.
 * Wraps a plain jsx template into an appropriate component if needed
 * @param  {Object} ast to wrap
 * @return {Object} ast containing the wrapped component
 */
export default function createReactComponent(ast, name) {
	// Get the last JSX expression in the outermost scope
	const jsx = getLastPlainJSX(ast);

	// Get user-provided exports
	const exports = getExports(ast);

	const hasDefaultExport = exports.some(isExportDefaultDeclaration);

	// If no plain jsx was found, assume we deal with
	// a complete JSX component definition
	if (hasDefaultExport || !jsx) {
		return ast;
	}

	// Get user-provided imports
	const {imports, identifiers} = getImports(ast);

	// If we render a stateless component
	// rewrite this.props to props
	traverse(ast, {
		MemberExpression(path) {
			if (path.matchesPattern('this.props')) {
				path.replaceWith(identifier('props'));
			}
		}
	});

	// Stuff we found so far
	const excludes = [...imports, jsx, ...exports];

	// Get all remaining code
	const auxiliary = getAuxiliary(ast, excludes);

	const component = getComponentTemplate(React)({
		AUXILIARY: auxiliary.map(path => path.node),
		JSX: jsx,
		NAME: identifier(name)
	});

	const defaultExport = exportDefaultDeclaration(component);

	// Remove auxiliary code
	auxiliary.map(aux => aux.remove());

	traverse(ast, {
		Program: {
			exit(path) {
				path.pushContainer('body', [
					defaultExport
				]);
			}
		}
	});

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

	// Remove jsx
	jsx.remove();

	return ast;
}
