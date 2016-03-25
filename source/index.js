import compareSemver from 'compare-semver';
import generate from 'babel-generator';
import template from 'babel-template';
import {
	exportDefaultDeclaration,
	identifier,
	isExportDefaultDeclaration,
	react as reactType,
	stringLiteral
} from 'babel-types';
import {transform} from 'babel-core';
import traverse from 'babel-traverse';
import {parse} from 'babylon';
import astDependencies from 'babylon-ast-dependencies';
import chalk from 'chalk';
import {kebabCase, merge} from 'lodash';
import pascalCase from 'pascal-case';
import React from 'react';
import {resolve} from 'try-require';

const signature = chalk.grey('[transform:react]');
const deprecation = chalk.yellow('[ ⚠  Deprecation ⚠ ]');

const classTemplate = template(`
	class NAME extends React.Component {
		render() {
			AUXILIARY;
			return (JSX);
		}
	}
`, {
	sourceType: 'module'
});

const functionTemplate = template(`
	function NAME (props) {
		AUXILIARY;
		return (JSX);
	}
`, {
	sourceType: 'module'
});

const importTemplate = template(`const LOCAL = require(IMPORTED);`, {
	sourceType: 'module'
});

function supportsStateless() {
	return compareSemver.gt(React.version, ['0.13.3']);
}

function getTemplate() {
	return supportsStateless() ?
		functionTemplate :
		classTemplate;
}

/**
 * Check if the passed opts object has a globals configuration
 * @param  {Object}  opts  used in transform-react
 * @return {Boolean}       if opts has a deprecated globals config
 */
function hasGlobalsConfiguration(opts) {
	return opts.globals && Object.keys(opts.globals).length > 0;
}

/**
 * Log a deprecation warning
 * @param  {Object} application to log on
 */
function deprecateGlobals(application) {
	application.log.warn(
		[
			deprecation,
			`${chalk.bold('"transforms.react.opts.globals"')} is deprecated`,
			'and will be removed in version 1.0. Use static properties on a common root component instead.',
			signature
		].join(' ')
	);
}

/**
 * Log a deprecation warning about implicit dependencies
 * @param  {Object} application to log on
 */
function deprecateImplicitDependencies(application, file, registry) {
	const names = Object.values(registry);

	application.log.warn(
		[
			deprecation,
			`  Found ${names.length} implicit imports in ${file.pattern.id}:${file.name}. `,
			'Implicit imports are deprecated and should be replaced with explicit ones. ',
			'Implicit imports will be removed in version 1.0. ',
			chalk.bold(`Add the following import statements to ${file.path}:`),
			'\n\n',
			Object.entries(registry)
				.map(item => {
					const [unboundIdentifier, importName] = item;
					const name = importName === 'pattern' ?
						'Pattern' :
						importName;
					return `import ${unboundIdentifier} from '${name}';`;
				}).join('\n'),
			'\n\n'
		].join('')
	);
}

const outerMostScopTypes = ['Program', 'File'];
const jsxTypes = ['JSXElement', 'JSXAttribute', 'JSXExpression'];

/**
 * Check if an ast node is in the outermost scope of a program or file
 * @param  {Object}  node babylon ast node to check the scope for
 * @return {Boolean}      if node is in the outermost scope
 */
function isTopLevel(path) {
	const scope = path.scope || {};
	const parentBlock = scope.parentBlock || {};
	const scopType = parentBlock.type || '';

	const parent = path.parent || {};
	const parentType = parent.type || '';

	return outerMostScopTypes.indexOf(scopType) > -1 &&
		jsxTypes.indexOf(parentType) === -1;
}

/**
 * Check if an ast node is in the outermost scope of a program or file
 * @param  {Object}  node babylon ast node to check the scope for
 * @return {Boolean}      if node is in the outermost scope
 */
function isAuxiliaryTopLevel(path) {
	const parent = path.parent || {};
	const parentType = parent.type || '';
	return path.type !== 'Program' &&
		outerMostScopTypes.indexOf(parentType) > -1;
}

/**
 * Get JSX expressions residing in the outermost scope of a program
 * @param  {Object} ast to search in
 * @return {Array}      of JSX expressions in the outermost scope
 */
function astPlainJSX(ast) {
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
}

/**
 * Get the last JSX expression in the outermost scope
 * @param {Object}        ast to search in
 * @return {Object|null}  Expression node or null
 */
function getLastPlainJSX(ast) {
	const plainJSX = astPlainJSX(ast);
	return plainJSX.length > 0 ?
		plainJSX[plainJSX.length - 1] :
		null;
}

/**
 * @typedef Imports
 * @type Object
 * @property {Array}  an Array of the paths belonging to
						import statements / require calls
 * @property {Array}  an Array of the imported names
 */

/**
 * Get all require calls and import statements
 * @param  {Object}   ast to search in
 * @return {Imports}  The import paths and their names
 */
function getImports(ast) {
	const imports = [];
	const identifiers = [];

	traverse(ast, {
		ImportDeclaration(path) {
			imports.push(path.node);
			identifiers.push(path.node.source.value);
		},
		CallExpression(path) {
			if (path.node.callee.name === 'require') {
				if (path.parent.type === 'VariableDeclarator') {
					imports.push(path.parentPath.parent);
				} else {
					imports.push(path.parent);
				}
				identifiers.push(path.node.arguments[0]);
			}
		}
	});

	return {imports, identifiers};
}

/**
 * Get all export statements
 * @param  {Object} ast to search in
 * @return {Array}      ast nodes of export declarations
 */
function getExports(ast) {
	const imports = [];

	traverse(ast, {
		ExportDeclaration(path) {
			imports.push(path.node);
		}
	});
	return imports;
}

/**
 * Get auxiliary code to embed into component's render function
 * @todo: Optimize code by pulling it out of render
 * @param  {Object} ast
 * @param  {Array<Node>} ast nodes to exclude from search
 * @return {Array<Node>} ast nodes to emebd into render
 */
function getAuxiliary(ast, exclude) {
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

/**
 * Create a React component definition from ast if needed.
 * Wraps a plain jsx template into an appropriate component if needed
 * @param  {Object} ast to wrap
 * @return {Object} ast containing the wrapped component
 */
function createReactComponent(ast, name) {
	// Get the last JSX expression in the outermost scope
	const jsx = getLastPlainJSX(ast);

	// Get user-provided exports
	const exports = getExports(ast);

	const hasDefaultExport = exports.some(isExportDefaultDeclaration);

	// If no plain jsx was found, assume we deal with
	// a complete JSX component definition
	if (hasDefaultExport || !jsx) {
		return ast;
	}

	// Get user-provided imports
	const {imports, identifiers} = getImports(ast);

	// If we render a stateless component
	// rewrite this.props to props
	traverse(ast, {
		MemberExpression(path) {
			if (path.matchesPattern('this.props')) {
				path.replaceWith(identifier('props'));
			}
		}
	});

	// Stuff we found so far
	const excludes = [...imports, jsx, ...exports];

	// Get all remaining code
	const auxiliary = getAuxiliary(ast, excludes);

	const component = getTemplate()({
		AUXILIARY: auxiliary.map(path => path.node),
		JSX: jsx,
		NAME: identifier(name)
	});

	const defaultExport = exportDefaultDeclaration(component);

	// Remove auxiliary code
	auxiliary.map(aux => aux.remove());

	traverse(ast, {
		Program: {
			exit(path) {
				path.pushContainer('body', [
					defaultExport
				]);
			}
		}
	});

	if (identifiers.includes('react') === false) {
		traverse(ast, {
			Program: {
				exit(path) {
					path.unshiftContainer('body', [
						importTemplate({
							LOCAL: identifier('React'),
							IMPORTED: stringLiteral('react')
						})
					]);
				}
			}
		});
	}

	// Remove jsx
	jsx.remove();

	return ast;
}

function normalizeTagName(tagName) {
	return tagName.toUpperCase() === tagName ?
		tagName.toLowerCase() :
		tagName;
}
/**
 * Get names of implicit dependencies for component ast
 * @param {Object} ast - ast to search for unbound identifiers
 * @return {Array<String>} local names to import implicitly
 * @deprecate
 */
function getImplicitDependencies(ast) {
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

/**
 * inject dependency imports into ast
 * @param  {Object} ast          babel ast
 * @param  {Object} dependencies importedName localName map
 * @return {Object}              babel ast with injected imports
 */
function injectImplicitDependencies(ast, dependencies) {
	const imports = Object.entries(dependencies)
		.map(item => {
			const [localName, importedName] = item;
			const name = importedName === 'pattern' ?
				'Pattern' :
				importedName;

			return importTemplate({
				LOCAL: identifier(localName),
				IMPORTED: stringLiteral(name)
			});
		});

	traverse(ast, {
		Program: {
			exit(path) {
				path.unshiftContainer('body', imports);
			}
		}
	});

	return ast;
}

function getResolvableDependencies(ast, file) {
	return astDependencies(ast)
		.map(dependency => dependency.source)
		.map(dependencyName => {
			const name = dependencyName === 'pattern' ?
				'Pattern' :
				dependencyName;

			const indexDependencies = file.dependencies.Pattern ?
				file.dependencies.Pattern :
				{};

			const resolveable = name in file.dependencies ||
				name in indexDependencies;

			if (resolveable) {
				return name;
			}

			const npmResolvable = resolve(name);

			if (npmResolvable) {
				file.meta.dependencies.push(name);
				return name;
			}

			const err = new Error([
				`Could not resolve dependency ${name}`,
				`in ${file.pattern.id}:${file.name},`,
				'it is not in pattern.json and could not be loaded from npm.',
				'Available pattern dependencies:',
				Object.keys(file.dependencies).join(', ')
			].join(' '));

			err.fileName = file.path;
			err.file = file.path;
			throw err;
		});
}

function convertCode(application, file, settings) {
	const parseKey = ['react', 'parse', file.path].join(':');
	const transformKey = ['react', 'transform', file.path].join(':');

	const ast = application.cache.get(parseKey, file.mtime) ||
		parse(file.buffer.toString('utf-8'), {
			allowImportExportEverywhere: true,
			allowReturnOutsideFunction: true,
			sourceType: 'module',
			plugins: [
				'jsx',
				'asyncFunctions',
				'classConstructorCall',
				'objectRestSpread',
				'decorators',
				'classProperties',
				'exportExtensions',
				'exponentiationOperator',
				'asyncGenerators',
				'functionBind',
				'functionSent'
			]
		});

	application.cache.set(parseKey, file.mtime, ast);

	// manifest.name is used as name for wrapped components
	const manifestName = file.pattern.manifest.name;

	// Get the component ast
	const component = createReactComponent(ast, pascalCase(manifestName));

	// Search for implicit dependencies
	const implicitDependencyRegistry = getImplicitDependencies(ast);
	const implicitDependencies = Object.values(implicitDependencyRegistry);

	// Implicit dependencies are deprecated, warn users about them
	if (implicitDependencies.length > 0) {
		deprecateImplicitDependencies(application, file, implicitDependencyRegistry);
		// Inject them anyway
		injectImplicitDependencies(component, implicitDependencyRegistry);
	}

	// Check if dependencies are found in pattern.dependencies,
	// get array of required dependency names
	const dependencyNames = getResolvableDependencies(component, file);

	if (settings.convertDependencies || settings.resolveDependencies) {
		// convert squashed dependencies
		file.dependencies = dependencyNames.reduce((registry, name) => {
			const dependency = file.dependencies[name];
			return dependency ? {
				...registry,
				[name]: convertCode(application, file.dependencies[name], settings)
			} :
			registry;
		}, {});
	}

	// TODO: use transformFromAst when switching to babel 6
	// TODO: transform should move to babel transform completely
	const {code} = application.cache.get(transformKey, file.mtime) ||
		transform(generate(component.program).code, settings.opts || {});

	application.cache.set(transformKey, file.mtime, {code});

	file.buffer = code;
	file.meta.react = merge({}, file.meta.react, {
		ast: component,
		dependencyNames
	});
	return file;
}

function getReactTransformFunction(application, config) {
	return async (file, _, configuration) => {
		const settings = merge({}, config, configuration);

		if (hasGlobalsConfiguration(settings.opts || {})) {
			deprecateGlobals(application);
		}

		return convertCode(application, file, settings);
	};
}

export default application => {
	const {configuration: {transforms: {react: config}}} = application;
	return getReactTransformFunction(application, config);
};
