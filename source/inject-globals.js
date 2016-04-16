import generate from 'babel-generator';
import traverse from 'babel-traverse';
import template from 'babel-template';
import {identifier} from 'babel-types';
import injectionTemplate from './injection-template';

/**
 * Inject global variables into a react component,
 * making them available via this[globalKey] (if possible, deprecated)
 * and on node's global object
 * @param  {Object} ast        generated by babel
 * @param  {Object} globals    global variables to inject
 * @return {Object}            ast with injected globals
 */
export default (ast, globals = {}) => {
	ast.deprecations = [];

	if (Object.keys(globals).length === 0) {
		return ast;
	}

	// This is some seriously twisted legacy burden
	// Until recently we injected globals into the scope of react components -
	// to do this in interop with all react component cases we have to
	// - find references to this.<globalKey>
	// - replace it with global.<globalKey>
	// - deprecate this stuff!
	traverse(ast, {
		MemberExpression(path) {
			const isGlobalLegacyReference = Object.keys(globals)
				.some(key => path.matchesPattern(`this.${key}`));
			if (isGlobalLegacyReference) {
				const previous = generate(path.node).code
					.split('.')
					.slice(1);
				const replaced = ['global', ...previous]
					.join('.');

				const pos = path.node.loc.start;
				ast.deprecations.push({
					key: previous[0],
					type: 'globalContextAccess',
					line: pos.line,
					column: pos.column,
					alternative: replaced
				});
				path.replaceWith(identifier(replaced));
			}
		}
	});

	if (ast.hasGlobals) {
		return ast;
	}

	ast.hasGlobals = true;

	// Inject access to global config
	// as global.<key>
	traverse(ast, {
		Program: {
			exit(path) {
				const IDENTIFIER = path.scope
					.generateUidIdentifier('injection');

				const INJECTION = template(
					`var ${IDENTIFIER.name} = ${JSON.stringify(globals)};`
				)();

				const injection = injectionTemplate({
					IDENTIFIER,
					INJECTION
				});

				path.unshiftContainer('body', injection);
			}
		}
	});

	return ast;
};

module.change_code = 1; // eslint-disable-line