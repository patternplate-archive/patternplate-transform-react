import React from 'react';

import generate from 'babel-generator';
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
import injectGlobals from './inject-globals';
import supportsStatelessComponents from './supports-stateless-components';

/**
 * Create a React component definition from ast if needed.
 * Wraps a plain jsx template into an appropriate component if needed
 * @param  {Object} ast to wrap
 * @param  {string} name of the component
 * @return {Object} ast containing the wrapped component
 */
export default function createReactComponent(ast, name, globals = {}) {
	// Get the last JSX expression in the outermost scope
	const jsx = getLastPlainJSX(ast);

	// Get user-provided exports
	const exports = getExports(ast);

	// Check for default export
	const hasDefaultExport = exports.some(isExportDefaultDeclaration);

	// Check if the React version supports stateless components
	const stateless = supportsStatelessComponents(React);

	// Inject globals into ast
	injectGlobals(ast, globals);

	// If a default export OR plain jsx was found, assume we deal with
	// a complete JSX component definition
	if (hasDefaultExport || !jsx) {
		return ast;
	}

	// Get user-provided imports
	const {imports, identifiers} = getImports(ast);

	// If we create
	// - a stateless component
	// - based on plain jsx
	// rewrite this.props to props
	if (stateless) {
		traverse(ast, {
			MemberExpression(path) {
				if (path.matchesPattern('this.props')) {
					path.replaceWith(identifier('props'));
				}
			}
		});
	}

	// Stuff we found so far
	const excludes = [...imports, jsx, ...exports];

	// Get all remaining code
	const auxiliary = getAuxiliary(ast, excludes);

	// Get a react component ast
	const component = getComponentTemplate(React)({
		AUXILIARY: auxiliary.map(path => path.node),
		JSX: jsx,
		NAME: identifier(name)
	});

	// Create a default export for it
	const defaultExport = exportDefaultDeclaration(component);

	// Remove auxiliary code
	auxiliary.map(aux => aux.remove());

	// Push the created react component into ast
	traverse(ast, {
		Program: {
			exit(path) {
				path.pushContainer('body', [
					defaultExport
				]);
			}
		}
	});

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

	// Remove jsx
	jsx.remove();
	return ast;
}

module.change_code = 1; // eslint-disable-line
