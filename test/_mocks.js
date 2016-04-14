import unindent from 'unindent';

const file = {
	fs: {
		node: {
			mtime: 0
		}
	},
	pattern: {
		manifest: {
			name: 'test'
		}
	},
	meta: {
		dependencies: [],
		react: {
		}
	}
};

export const OldReact = {
	version: '0.13.3'
};

export const React = {
	version: '0.14.0'
};

export const config = {
	opts: {
	}
};

export const application = {
	configuration: {
		transforms: {
			react: config
		}
	},
	cache: {
		get() {
			return null;
		},
		set() {
			return null;
		}
	}
};

export const emptyFile = {
	...file,
	buffer: new Buffer(''),
	path: 'empty/index.jsx',
	dependencies: {}
};

export const plainFile = {
	...file,
	buffer: new Buffer('<div />'),
	dependencies: {}
};

export const plainAsiFile = {
	...file,
	buffer: new Buffer(unindent(`
	console.log()
	// foo bar
	<div/>
	`)),
	dependencies: {}
};

export const statelessFile = {
	...file,
	buffer: new Buffer(unindent(`
	export default (props) => {
		return (<div />);
	};
	`)),
	path: 'stateless/index.jsx',
	dependencies: {}
};

export const fullFile = {
	...file,
	buffer: new Buffer(unindent(`
	import React from 'react';

	export default class FullComponent extends React.Component {
		render() {
			return <div />;
		}
	}
	`)),
	path: 'full/index.jsx',
	dependencies: {}
};
