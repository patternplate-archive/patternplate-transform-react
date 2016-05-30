import unindent from 'unindent';

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
	meta: {
		dependencies: [],
		react: {
		}
	}
};

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

const emptyFile = {
	...file,
	buffer: new Buffer(''),
	path: 'empty/index.jsx',
	dependencies: {}
};

const plainFile = {
	...file,
	buffer: new Buffer('<div />'),
	dependencies: {}
};

const plainAsiFile = {
	...file,
	buffer: new Buffer(unindent(`
	console.log()
	// foo bar
	<div/>
	`)),
	dependencies: {}
};

const statelessFile = {
	...file,
	buffer: new Buffer(unindent(`
	import React from 'react';

	export default (props) => {
		return (<div />);
	};
	`)),
	path: 'stateless/index.jsx',
	dependencies: {}
};

const fullFile = {
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

const reservedPropsDeclaration = {
	...file,
	buffer: new Buffer(unindent(`
	const props = {
		content: 'foo',
		className: 'bar'
	};
	<div {...this.props} className={props.className}>
		{props.content}
	</div>
	`)),
	dependencies: {}
};

const reservedContextDeclaration = {
	...file,
	buffer: new Buffer(unindent(`
	const context = {
		content: 'foo',
		className: 'bar'
	};
	<div {...this.props} className={context.className}>
		{context.content}
	</div>
	`)),
	dependencies: {}
};

const variableDeclarator = {
	...file,
	buffer: new Buffer(unindent(`
	const Test = {};
	const key = props.foo;
	<div {...props} key={key}/>
	`)),
	dependencies: {}
};

const functionDeclarator = {
	...file,
	buffer: new Buffer(unindent(`
	// function Test(props) { console.log(props); };
	function _Test() { console.log(props); };
	// Test(props);
	_Test();
	<div/>
	`)),
	dependencies: {}
};

const classDeclarator = {
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
	`)),
	dependencies: {}
};

const plainThis = {
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
	`)),
	dependencies: {}
};

const dependency = {
	...file,
	buffer: new Buffer(unindent(`
	<div className="dependency"/>
	`)),
	dependencies: {}
};

const implicitDependencies = {
	...file,
	buffer: new Buffer(unindent(`
	<div>
		<Dependency />
	</div>
	`)),
	dependencies: {
		dependency
	}
};

const missingDependencies = {
	...file,
	buffer: new Buffer(unindent(`
	<MissingDependency />
	`)),
	dependencies: {
		dependency
	}
};

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
	missingDependencies
};
