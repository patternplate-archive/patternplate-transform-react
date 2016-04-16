import generate from 'babel-generator';
import traverse from 'babel-traverse';

import {
	isScopable,
	isProgram,
	isMemberExpression,
	isThisExpression,
	identifier
} from 'babel-types';

/**
 * Get the top level scope for a given path
 * @param  {Object} path
 * @return {Object} path holding the top-level scope
 */
function getTopScopePath(path) {
	while (path.scope.parent && !isScopable(path)) {
		path = path.scope.parent.path;
	}
	return path;
}

/**
 * Check if a given path has it scope in the top level
 * @param  {Object}  path
 * @return {Boolean}
 */
function hasRenderParent(path) {
	const scopePath = getTopScopePath(path);

	if (isProgram(scopePath)) {
		return true;
	}

	return false;
}

/**
 * Check if a node is a react-specific member expression
 * @param  {Object}  node
 * @return {Boolean}
 */
function isReactMemberExpression(node) {
	if (
			node.object &&
			!isThisExpression(node.object) &&
			!isMemberExpression(node.object)
		) {
		return false;
	}

	if (isMemberExpression(node.object)) {
		return isReactMemberExpression(node.object);
	}

	return ['props', 'context'].includes(node.property.name);
}

/**
 * Rewrite member expressions matching this.props or this.context
 * @TODO: Rewrite member expression in lower scopes if applicable
 * - arrow functions
 * - blocks
 */
export default ast => {
	traverse(ast, {
		MemberExpression: {
			enter(path) {
				// const {scope: {parentBlock}} = path;
				if (!isReactMemberExpression(path.node)) {
					// console.log(frame(generate(ast.program).code, path.node.loc.start.line, path.node.loc.start.column));
					// console.log(path.node.property.name);
					return;
				}

				if (!hasRenderParent(path)) {
					path.skip();
					return;
				}

				const sliced = generate(path.node).code
					.split('.')
					.slice(1)
					.join('.');

				path.replaceWith(identifier(sliced));
			}
		}
	});

	return ast;
};

module.change_code = 1; // eslint-disable-line
