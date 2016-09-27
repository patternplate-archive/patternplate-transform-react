import generate from 'babel-generator';
import {merge, uniq} from 'lodash';
import md5 from 'md5';
import pascalCase from 'pascal-case';
import transformJSX from 'babylon-jsx';

import createReactComponent from './create-react-component';
import getResolvableDependencies from './get-resolvable-dependencies';
import parse from './parse';

async function convertCode(application, file, settings) {
	const options = settings.opts || {globals: {}};
	const source = (file.buffer || '').toString('utf-8');
	const cached = getCached(source, source, application.cache);

	const component = cached.isCached ? null : getComponent(source, {
		application, options, manifest: file.pattern.manifest, parseKey: cached.parseKey
	});

	const dependencyNames = cached.dependencyNames ||
		uniq(await getResolvableDependencies(component, file));

	await Promise.all(dependencyNames.map(async name => {
		const {dependencies} = file;
		const dependency = dependencies[name];
		if (typeof dependency === 'undefined') {
			return Promise.resolve();
		}
		dependencies[name] = await convertCode(application, dependency, settings);
		return dependencies[name];
	}));

	const program = cached.isCached ? null : transformJSX(component, 'React.createElement');

	const {code} = cached.isCached ? cached : generate(program.program);
	application.cache.set(cached.transformKey, false, {code, dependencyNames});

	file.buffer = `'use strict';\n${code}`;
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

function getComponent(source, context) {
	const {application, manifest, parseKey, options} = context;

	const ast = application.cache.get(parseKey, false) ||
		parse(source);

	application.cache.set(parseKey, null, ast);

	// manifest.name is used as name for wrapped components
	const manifestName = manifest.name;

	// Get the component ast
	return createReactComponent(ast, pascalCase(manifestName), options.globals);
}

function getCached(source, options, cache) {
	const hash = md5(source);

	const parseKey = [
		'react',
		'parse',
		hash,
		JSON.stringify(options.globals)
	].join(':');

	const transformKey = [
		'react',
		'transform',
		hash,
		JSON.stringify(options.globals)
	].join(':');

	const cached = cache.get(transformKey, false) || {
		dependencyNames: null, code: null
	};

	const isCached = cached.code !== null;

	return {
		code: cached.code,
		dependencyNames: cached.dependencyNames,
		isCached,
		parseKey,
		transformKey
	};
}
