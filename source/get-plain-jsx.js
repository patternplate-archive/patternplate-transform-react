import traverse from 'babel-traverse';
import isTopLevel from './is-top-level';

/**
 * Get JSX expressions residing in the outermost scope of a program
 * @param  {Object} ast to search in
 * @return {Array}      of JSX expressions in the outermost scope
 */
export default ast => {
	const plain = [];

	traverse(ast, {
		JSXElement: {
			exit(path) {
				if (isTopLevel(path)) {
					plain.push(path);
				}
			}
		}
	});

	return plain;
};

module.change_code = 1; // eslint-disable-line
