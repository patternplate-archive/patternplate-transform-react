import traverse from 'babel-traverse';
import isAuxiliaryTopLevel from './is-auxiliary-top-level';

/**
 * Get auxiliary code to embed into component's render function
 * @todo: Optimize code by pulling it out of render
 * @param  {Object} ast
 * @param  {Array<Node>} ast nodes to exclude from search
 * @return {Array<Node>} ast nodes to emebd into render
 */
export default function getAuxiliary(ast, exclude) {
	const auxiliary = [];

	traverse(ast, {
		enter(path) {
			if (isAuxiliaryTopLevel(path) &&
					(
						exclude.indexOf(path.node) === -1 &&
						exclude.indexOf(path) === -1
					)
			) {
				auxiliary.push(path);
			}
		}
	});

	return auxiliary;
}
