import traverse from 'babel-traverse';
import {react as reactType} from 'babel-types';
import {kebabCase} from 'lodash';
import normalizeTagName from './normalize-tag-name';

/**
 * Get names of implicit dependencies for component ast
 * @param {Object} ast - ast to search for unbound identifiers
 * @return {Array<String>} local names to import implicitly
 * @deprecate
 */
export default function getImplicitDependencies(ast) {
	const dependencies = [];

	traverse(ast, {
		ReferencedIdentifier(path) {
			const binding = path.scope.getBinding(path.node.name);

			if (!binding) {
				if (path.isJSXIdentifier()) {
					const normalizedName = normalizeTagName(path.node.name);
					if (!reactType.isCompatTag(normalizedName)) {
						dependencies.push(path);
						return;
					}
				}
			}
		}
	});

	return dependencies.reduce((registry, path) => {
		return {
			...registry,
			[path.node.name]: kebabCase(path.node.name)
		};
	}, {});
}

module.change_code = 1; // eslint-disable-line
