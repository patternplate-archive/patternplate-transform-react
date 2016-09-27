// eslint-disable xo/filename-case;
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
	var React = require('react');

	module.exports = props => {
		return (<div />);
	};
	`)),
	path: 'stateless/index.jsx'
});

const fullFile = getFile({
	...file,
	buffer: new Buffer(unindent(`
	var React = require('react');

	module.exports = React.createClass({
		render() {
			return <div />;
		}
	});
	`)),
	path: 'full/index.jsx'
});

const reservedPropsDeclaration = getFile({
	...file,
	buffer: new Buffer(unindent(`
	var props = {
		content: 'foo',
		className: 'bar'
	};
	<div className="bar">
		{props.content}
	</div>
	`))
});

const reservedContextDeclaration = getFile({
	...file,
	buffer: new Buffer(unindent(`
	var context = {
		content: 'foo',
		className: 'bar'
	};
	<div className={context.className}>
		{context.content}
	</div>
	`))
});

const variableDeclarator = getFile({
	...file,
	buffer: new Buffer(unindent(`
	'use strict';
	var Test = {};
	var key = props.key;
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
			var Component = this.props.component;
			var props = this.props;
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
	'use strict';
	var foo = this.props.foo;
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
		{this.state.foo}
		<Foo {...foo}>
			{foo.children}
		</Foo>
	</div>
	`))
});

const plainState = getFile({
	...file,
	buffer: new Buffer(unindent(`
	var onClick = () => {
		this.setState({
			quality: 'tainted'
		});
	};
	<div
		className={this.state.quality}
		onClick={onClick}
		/>
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

const tagNameishImplicitDependencies = getFile({
	...file,
	buffer: new Buffer(unindent(`
	Image.doStuff();
	<div>
		<Button/>
	</div>
	`)),
	dependencies: {
		image: dependency,
		button: dependency,
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
	var _ = require('lodash');
	var fp = require('lodash/fp');
	var Dependency = require('dependency');
	console.log(_.uniq);

	<div />
	`)),
	dependencies: {
		dependency
	}
});

const simpleFile = getFile({
	...file,
	buffer: new Buffer(unindent(`
	var React = require('react');
	var Dependency = require('dependency');

	<div {...props} className={props.className}>
		<Dependency/>
	</div>
	`)),
	dependencies: {
		dependency
	}
});

const reactRequire = getFile({
	...file,
	buffer: new Buffer(unindent(`
	var React = require('react');
	<div/>
	`))
});

export {
	application,
	classDeclarator,
	config,
	dependency,
	emptyFile,
	explicitDependencies,
	fullFile,
	functionDeclarator,
	implicitDependencies,
	missingDependencies,
	OldReact,
	plainAsiFile,
	plainFile,
	plainState,
	plainThis,
	React,
	reactRequire,
	reservedContextDeclaration,
	reservedPropsDeclaration,
	simpleFile,
	statelessFile,
	tagNameishImplicitDependencies,
	variableDeclarator
};
