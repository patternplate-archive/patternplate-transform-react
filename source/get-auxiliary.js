import traverse from 'babel-traverse';

/* import {
	isMemberExpression
} from 'babel-types'; */

import isAuxiliaryTopLevel from './is-auxiliary-top-level';

function isExcluded(excludes, path) {
	return excludes.includes(path.node) ||
		excludes.includes(path);
}

/**
 * Check if a path has to reside in the render function
 * @param  {object}  path babel-ast path
 * @return {Boolean}
 */
function isRenderBound() {
	return true;
}

/**
 * Get auxiliary code to embed into component's render function
 * @param  {Object} ast
 * @param  {Array<Node>} ast nodes to exclude from search
 * @return {Array<Node>} ast nodes to emebd into render
 */
export default (ast, exclude) => {
	const auxiliary = [];

	traverse(ast, {
		exit(path) {
			if (!isAuxiliaryTopLevel(path)) {
				return;
			}

			if (isExcluded(exclude, path)) {
				return;
			}

			if (isRenderBound(path)) {
				auxiliary.push(path);
			}
		}
	});

	return auxiliary;
};


