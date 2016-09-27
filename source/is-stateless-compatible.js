import traverse from 'babel-traverse';
import {isThisExpression} from 'babel-types';

const propMembers = ['props', 'context'];
const stateMembers = ['setState', 'state'];

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
				.filter(decl => decl.id)
				.find(decl => {
					return propMembers.includes(decl.id.name);
				});

			if (colliding) {
				collisions.push(colliding);
			}
		},
		MemberExpression: {
			enter(path) {
				// check for occurrences of this.state and this.setState
				const obj = path.node.object;
				const prop = path.node.property;

				if (isThisExpression(obj) && stateMembers.includes(prop.name)) {
					collisions.push(path.node.property);
				}
			}
		}
	});

	return collisions.length === 0;
};
