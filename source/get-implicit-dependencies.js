import traverse from 'babel-traverse';
import {react as reactType} from 'babel-types';
import {difference, kebabCase, uniq} from 'lodash';
import pascalCase from 'pascal-case';
import getImports from './get-imports';
import normalizeTagName from './normalize-tag-name';

/**
 * Get names of implicit dependencies for component ast
 * @param {Object} ast - ast to search for unbound identifiers
 * @return {Array<String>} local names to import implicitly
 * @deprecate
 */
export default function getImplicitDependencies(ast) {
	const unboundIdentifiers = [];

	traverse(ast, {
		ReferencedIdentifier(path) {
			const binding = path.scope.getBinding(path.node.name);

			if (!binding) {
				if (path.isJSXIdentifier()) {
					const normalizedName = normalizeTagName(path.node.name);

					if (!reactType.isCompatTag(normalizedName)) {
						unboundIdentifiers.push(normalizedName);
						return;
					}
				}
			}
		}
	});

	const explicitDependencies = getImports(ast).identifiers
		.map(({value}) => pascalCase(value));

	const implicitDependencies = uniq(difference(
			unboundIdentifiers,
			explicitDependencies
		));

	return implicitDependencies
		.reduce((registry, implicitDependencyName) => {
			return {
				...registry,
				[implicitDependencyName]: kebabCase(implicitDependencyName)
			};
		}, {});
}

module.change_code = 1; // eslint-disable-line
