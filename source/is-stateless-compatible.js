import traverse from 'babel-traverse';

/**
 * Check if a given plain jsx is compatible with transformation to a stateless
 * component
 * - no collision with "props"
 * - no collision with "context"
 *
 * @type {object} ast
 * @return boolean
 */
export default ast => {
	let collisions = [];

	traverse(ast, {
		Declaration(path) {
			if (path.parent.type !== 'Program') {
				return;
			}

			const declarations = path.node.declarations || [path.node];

			const colliding = declarations
				// Check for naming collision
				.filter(decl => {
					return decl.id && ['props', 'context'].includes(decl.id.name);
				});

			collisions = [...collisions, ...colliding];
		}
	});

	return collisions.length === 0;
};

module.change_code = 1; // eslint-disable-line
