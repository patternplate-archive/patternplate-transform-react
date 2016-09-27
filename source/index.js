import chalk from 'chalk';
import generate from 'babel-generator';
import {merge, values} from 'lodash';
import pascalCase from 'pascal-case';
import transformJSX from 'babylon-jsx';

import createReactComponent from './create-react-component';
import getImplicitDependencies from './get-implicit-dependencies';
import getResolvableDependencies from './get-resolvable-dependencies';
import parse from './parse';

async function convertCode(application, file, settings) {
	const deprecationMapping = {
		default(item) {
			const lines = file.source
				.toString()
				.split('\n')
				.slice(Math.max(item.line - 2, 0), 4);

			const message = [
				`[ ⚠  Deprecation ⚠ ]`,
				`${item.type} "${item.key}" is deprecated.`,
				`Use ${item.alternative} instead.`,
				`Found in`,
				`${file.pattern.id}/${file.name}:${item.line}:${item.column}`
			].join(' ');

			const snippet = [
				`\n\n`,
				`${chalk.grey(item.line - 1)} ${lines[0]}\n`,
				`${chalk.yellow(item.line)} ${lines[1]}\n`,
				`${chalk.grey(item.line + 1)} ${lines[2]}\n`
			].join('');

			application.log.warn(chalk.yellow(message), snippet);
		}
	};

	const options = settings.opts || {globals: {}};
	const parseKey = [
		'react',
		'parse',
		file.path,
		JSON.stringify(options.globals)
	].join(':');

	const transformKey = [
		'react',
		'transform',
		file.path,
		JSON.stringify(options.globals)
	].join(':');

	const mtime = file.mtime || file.fs.node.mtime;

	const ast = application.cache.get(parseKey, mtime) ||
		parse(file.buffer.toString('utf-8'));

	application.cache.set(parseKey, mtime, ast);

	// manifest.name is used as name for wrapped components
	const manifestName = file.pattern.manifest.name;

	// Get the component ast
	const component = createReactComponent(
		ast,
		pascalCase(manifestName),
		options.globals
	);

	(ast.deprecations || [])
		.forEach(deprecation => {
			const fn = deprecationMapping[deprecation] ||
				deprecationMapping.default;
			fn(deprecation);
		});

	const depNames = Object.keys(file.dependencies).map(name => pascalCase(name));

	// TODO: Remove this with the next feature release
	// Search for implicit dependencies
	const implicitDependencyRegistry = getImplicitDependencies(ast, depNames);
	const implicitDependencies = values(implicitDependencyRegistry);
	if (implicitDependencies.length > 0) {
		const list = implicitDependencies.join(', ');
		throw new Error(`Implicit dependencies are not supported after patternplate-transform-react@1. Implicit dependencies found: ${list}`);
	}

	// Check if dependencies are found in pattern.dependencies,
	// get array of required dependency names
	const dependencyNames = await getResolvableDependencies(component, file);

	if (settings.convertDependencies || settings.resolveDependencies) {
		// convert squashed dependencies
		await Promise.all(dependencyNames.map(async name => {
			const {dependencies} = file;
			const dependency = dependencies[name];
			if (typeof dependency === 'undefined') {
				return Promise.resolve();
			}
			dependencies[name] = await convertCode(application, dependency, settings);
			return dependencies[name];
		}));
	}

	const program = transformJSX(component, 'React.createElement');

	const {code} = application.cache.get(transformKey, mtime) ||
		generate(program.program);

	application.cache.set(transformKey, mtime, {code});

	file.buffer = code;
	file.meta.react = merge({}, file.meta.react, {
		ast: program,
		dependencyNames
	});
	return file;
}

function getReactTransformFunction(application, config) {
	return async (file, _, configuration) => {
		const settings = merge({}, config, configuration);
		return await convertCode(application, file, settings);
	};
}

export default application => {
	const {configuration: {transforms: {react: config}}} = application;
	return getReactTransformFunction(application, config);
};
