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
	},
	log: {
		warn() {
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
	import React from 'react';

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

export const reservedPropsDeclaration = {
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

export const reservedContextDeclaration = {
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

export const variableDeclarator = {
	...file,
	buffer: new Buffer(unindent(`
	const Test = {};
	const key = props.foo;
	<div {...props} key={key}/>
	`)),
	dependencies: {}
};

export const functionDeclarator = {
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

export const classDeclarator = {
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

export const plainThis = {
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

export const dependency = {
	...file,
	buffer: new Buffer(unindent(`
	<div className="dependency"/>
	`)),
	dependencies: {}
};

export const implicitDependencies = {
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

export const missingDependencies = {
	...file,
	buffer: new Buffer(unindent(`
	<MissingDependency />
	`)),
	dependencies: {
		dependency
	}
};
