import vm from 'vm';
import {merge} from 'lodash';
import Promise from 'bluebird';
import React from 'react';
import {renderToStaticMarkup} from 'react-dom/server';

const defaults = {
	console,
	exports: {},
	module,
	require
};

const render = (Component, props, children) => {
	const component = React.createElement(Component, props, children);
	return renderToStaticMarkup(component);
};

const virtualModule = (code, options) => {
	const settings = merge({}, defaults, options);
	return vm.runInNewContext(code, settings);
};

const virtualRender = (code, options, props, children) => {
	const Component = virtualModule(code, options);
	return render(Component, props, children);
};

const runTimes = async (fn, times = 1, initial) => {
	return Promise.reduce(Array(times).fill(), async registry => {
		const previous = registry[registry.length - 1];
		return [...registry, await fn(previous || initial)];
	}, []);
};

class StatelessWrapper extends React.Component {
	render() {
		return this.props.children;
	}
}

export {
	render,
	virtualModule,
	virtualRender,
	runTimes,
	StatelessWrapper
};
