import Promise from 'bluebird';
import React from 'react';
import {renderToStaticMarkup} from 'react-dom/server';
import requireFromString from 'require-from-string';

const render = (Component, props, children) => {
	const component = React.createElement(Component, props, children);
	return renderToStaticMarkup(component);
};

const virtualModule = requireFromString;

const virtualRender = (code, options, props, children) => {
	const Component = requireFromString(code);
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

const trap = () => {
	const errors = [];
	const warnings = [];

	function release() {
		delete console.warn;
		delete console.error;
		return {errors, warnings};
	}

	console.error = (...args) => errors.push(args);
	console.warn = (...args) => warnings.push(args);

	return release;
};

export {
	render,
	virtualModule,
	virtualRender,
	runTimes,
	StatelessWrapper,
	trap
};
