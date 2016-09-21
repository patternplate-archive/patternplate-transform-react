import traverse from 'babel-traverse';
import {react as reactType} from 'babel-types';
import {difference, kebabCase, uniq} from 'lodash';
import pascalCase from 'pascal-case';
import getImports from './get-imports';
import normalizeTagName from './normalize-tag-name';

/**
 * Get names of implicit dependencies for component ast
 * @param {Object} ast - ast to search for unbound identifiers
 * @param {Array<String>} candidates - normalized dependency names to import
 * @return {Array<String>} local names to import implicitly
 * @deprecate
 */
export default (ast, candidates = []) => {
	const unboundIdentifiers = [];

	traverse(ast, {
		ReferencedIdentifier(path) {
			const binding = path.scope.getBinding(path.node.name);

			if (binding) {
				return;
			}

			const normalizedName = normalizeTagName(path.node.name);

			// if is jsx or is PascalCase
			// const firstChar = path.node.name.charAt(0);
			if (!path.isJSXIdentifier() && !candidates.includes(normalizedName)) {
				return;
			}

			if (reactType.isCompatTag(normalizedName)) {
				return;
			}

			unboundIdentifiers.push(normalizedName);
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
};

module.change_code = 1; // eslint-disable-line
