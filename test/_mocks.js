import unindent from 'unindent';
import {merge} from 'lodash/fp';

const file = {
	path: 'mocks/index.jsx',
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
	dependencies: {},
	meta: {
		dependencies: [],
		react: {
		}
	}
};

const getFile = merge(file);

const OldReact = {
	version: '0.13.3'
};

const React = {
	version: '0.14.0'
};

const config = {
	opts: {
	}
};

const application = {
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
	},
	log: {
		warn() {
		}
	}
};

const emptyFile = getFile({
	buffer: new Buffer(''),
	path: 'empty/index.jsx'
});

const plainFile = getFile({
	buffer: new Buffer('<div />')
});

const plainAsiFile = getFile({
	buffer: new Buffer(unindent(`
	console.log('this. should. fail.')
	// foo bar
	<div/>
	`))
});

const statelessFile = getFile({
	...file,
	buffer: new Buffer(unindent(`
	import React from 'react';

	export default (props) => {
		return (<div />);
	};
	`)),
	path: 'stateless/index.jsx'
});

const fullFile = getFile({
	...file,
	buffer: new Buffer(unindent(`
	import React from 'react';

	export default class FullComponent extends React.Component {
		render() {
			return <div />;
		}
	}
	`)),
	path: 'full/index.jsx'
});

const reservedPropsDeclaration = getFile({
	...file,
	buffer: new Buffer(unindent(`
	const props = {
		content: 'foo',
		className: 'bar'
	};
	<div {...this.props} className="bar">
		{props.content}
	</div>
	`))
});

const reservedContextDeclaration = getFile({
	...file,
	buffer: new Buffer(unindent(`
	const context = {
		content: 'foo',
		className: 'bar'
	};
	<div {...this.props} className={context.className}>
		{context.content}
	</div>
	`))
});

const variableDeclarator = getFile({
	...file,
	buffer: new Buffer(unindent(`
	const Test = {};
	const key = props.key;
	<div {...props} key={key}/>
	`))
});

const functionDeclarator = getFile({
	...file,
	buffer: new Buffer(unindent(`
	// function Test(props) { console.log(props); };
	function _Test() { console.log(props); };
	// Test(props);
	_Test();
	<div/>
	`))
});

const classDeclarator = getFile({
	...file,
	buffer: new Buffer(unindent(`
	class Test {
		render() {
			const {
				component: Component,
				...props
			} = this.props;
			return <Component {...props} />;
		}
	};
	new Test();
	<div/>
	`))
});

const plainThis = getFile({
	...file,
	buffer: new Buffer(unindent(`
	const foo = this.props.foo;
	class Foo extends React.Component {
		render() {
			return (
				<div {...this.props}>
					{this.props.children}
				</div>
			);
		}
	}
	<div {...this.props}>
		{this.props.children}
		<Foo {...foo}>
			{foo.children}
		</Foo>
	</div>
	`))
});

const dependency = getFile({
	...file,
	buffer: new Buffer(unindent(`
	<div className="dependency"/>
	`))
});

const implicitDependencies = getFile({
	...file,
	buffer: new Buffer(unindent(`
	<div>
		<Dependency />
	</div>
	`)),
	dependencies: {
		dependency
	}
});

const missingDependencies = getFile({
	...file,
	buffer: new Buffer(unindent(`
	<MissingDependency />
	`)),
	dependencies: {
		dependency
	}
});

const explicitDependencies = getFile({
	...file,
	buffer: new Buffer(unindent(`
	import _ from 'lodash';
	import fp from 'lodash/fp';
	import Dependency from 'dependency';
	console.log(_.uniq);

	<div />
	`)),
	dependencies: {
		dependency
	}
});

export {
	OldReact,
	React,
	config,
	application,
	emptyFile,
	plainFile,
	plainAsiFile,
	statelessFile,
	fullFile,
	reservedPropsDeclaration,
	reservedContextDeclaration,
	variableDeclarator,
	functionDeclarator,
	classDeclarator,
	plainThis,
	dependency,
	implicitDependencies,
	missingDependencies,
	explicitDependencies
};
