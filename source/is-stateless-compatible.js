import traverse from 'babel-traverse';

const stateProps = ['setState', 'state'];

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
	const collisions = [];

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

			collisions.push(colliding);
		},
		MemberExpression: {
			enter(path) {
				// check for occurrences of this.state and this.setState
				if (stateProps.includes(path.node.property)) {
					collisions.push(path.node.property);
				}
			}
		}
	});

	return collisions.length === 0;
};


