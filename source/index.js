import generate from 'babel-generator';
import {transform} from 'babel-core';
import {parse} from 'babylon';
import {merge, omit} from 'lodash';
import pascalCase from 'pascal-case';

import createReactComponent from './create-react-component';
import deprecateGlobalConfiguration from './deprecate-global-configuration';
import deprecateImplicitDependencies from './deprecate-implicit-dependencies';
import getImplicitDependencies from './get-implicit-dependencies';
import getResolvableDependencies from './get-resolvable-dependencies';
import injectImplicitDependencies from './inject-implicit-dependencies';

function convertCode(application, file, settings) {
	const options = settings.opts || {globals:{}};
	const parseKey = ['react', 'parse', file.path].join(':');
	const transformKey = ['react', 'transform', file.path].join(':');
	const mtime = file.mtime || file.fs.node.mtime;

	const ast = application.cache.get(parseKey, mtime) ||
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

	application.cache.set(parseKey, mtime, ast);

	// manifest.name is used as name for wrapped components
	const manifestName = file.pattern.manifest.name;

	if (Object.keys(options.globals).length > 0) {
		deprecateGlobalConfiguration(application, file, options.globals);
	}

	// Get the component ast
	const component = createReactComponent(
		ast,
		pascalCase(manifestName),
		options.globals
	);

	// Search for implicit dependencies
	const implicitDependencyRegistry = getImplicitDependencies(ast);
	const implicitDependencies = Object.values(implicitDependencyRegistry);

	// Implicit dependencies are deprecated, warn users about them
	if (implicitDependencies.length > 0) {
		deprecateImplicitDependencies(
			application, file, implicitDependencyRegistry
		);
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

	const babelOptions = omit(options, ['globals']);

	// TODO: use transformFromAst when switching to babel 6
	// TODO: transform should move to babel transform completely
	const {code} = application.cache.get(transformKey, mtime) ||
		transform(generate(component.program).code, babelOptions);

	application.cache.set(transformKey, mtime, {code});

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
		return convertCode(application, file, settings);
	};
}

export default application => {
	const {configuration: {transforms: {react: config}}} = application;
	return getReactTransformFunction(application, config);
};

module.change_code = 1; // eslint-disable-line
