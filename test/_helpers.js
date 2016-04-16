import vm from 'vm';
import {merge} from 'lodash';
import React from 'react';
import {renderToStaticMarkup} from 'react-dom/server';

const defaults = {
	exports: {},
	module,
	require
};

export const render = (Component, props, children) => {
	const component = React.createElement(Component, props, children);
	return renderToStaticMarkup(component);
};

export const virtualModule = (code, options) => {
	const settings = merge({}, defaults, options);
	return vm.runInNewContext(code, settings);
};

export const virtualRender = (code, options, props, children) => {
	const Component = virtualModule(code, options);
	return render(Component, props, children);
};
