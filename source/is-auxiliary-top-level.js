import outerMostScopeTypes from './outermost-scope-types';

/**
 * Check if an ast node is in the outermost scope of a program or file
 * @param  {Object}  node babylon ast node to check the scope for
 * @return {Boolean}      if node is in the outermost scope
 */
export default function isAuxiliaryTopLevel(path) {
	const parent = path.parent || {};
	const parentType = parent.type || '';
	return path.type !== 'Program' &&
		outerMostScopeTypes.indexOf(parentType) > -1;
}
