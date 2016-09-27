import React from 'react';

import * as t from 'babel-types';
import traverse from 'babel-traverse';

import createExport from './create-export';
import getAuxiliary from './get-auxiliary';
import getComponentTemplate from './get-component-template';
import getExports from './get-exports';
import getImports from './get-imports';
import getLastPlainJSX from './get-last-plain-jsx';
import injectGlobals from './inject-globals';
import injectReactImport from './inject-react-import';
import isStatelessCompatible from './is-stateless-compatible';
import supportsStatelessComponents from './supports-stateless-components';
import rewriteMemberExpressions from './rewrite-member-expressions';

/**
 * Create a React component definition from ast
 * Wraps a plain jsx template into an appropriate component if needed
 * @param  {Object} ast to wrap
 * @param  {string} name of the component
 * @return {Object} ast containing the wrapped component
 */
export default (ast, name, globals = {}) => {
	// Get the last JSX expression in the outermost scope
	const jsx = getLastPlainJSX(ast);

	// Get user-provided exports
	const exports = getExports(ast);

	// Check for default export
	const hasDefaultExport = exports.some(t.isExportDefaultDeclaration);

	// Inject globals into ast
	injectGlobals(ast, globals);

	// If a default export OR no plain jsx was found, assume we deal with
	// a complete JSX component definition
	if (hasDefaultExport || !jsx) {
		return ast;
	}

	// Check if the React version supports stateless components
	const stateless = supportsStatelessComponents(React) &&
		isStatelessCompatible(ast);

	// Get user-provided imports
	const {imports} = getImports(ast);

	// Stuff we found so far
	const excludes = [...imports, jsx, ...exports];

	// Get remaining code
	const auxiliary = getAuxiliary(
		ast,
		excludes,
		stateless
	);

	// Push the created react component into ast
	traverse(ast, {
		Program: {
			exit(path) {
				const NAME = path.scope.generateUidIdentifier(name);

				// Get a react component ast
				const component = getComponentTemplate({stateless})({
					AUXILIARY: auxiliary.map(path => path.node),
					JSX: jsx.node,
					NAME
				});

				// Create a default export for it
				const defaultExport = createExport(NAME);
				path.pushContainer('body', [
					component,
					defaultExport
				]);
			}
		}
	});

	// Rewrite member expressions for stateless components
	// to ease the transition for older projects
	// - this.props => props
	// - this.context => context
	if (stateless) {
		rewriteMemberExpressions(ast);
	}

	// Inject react import if it is missing
	injectReactImport(ast);

	// Remove jsx
	jsx.remove();

	// Remove auxiliary code
	auxiliary.map(aux => aux.remove());

	return ast;
};