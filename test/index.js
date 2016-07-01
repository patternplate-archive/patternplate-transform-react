import 'babel-register';
import 'babel-polyfill';

import test from 'ava';
import unexpected from 'unexpected';
import unexpectedReact from 'unexpected-react';
import {uniqBy} from 'lodash';
import * as ReactTestUtils from 'react-addons-test-utils';
import * as React from 'react'; // eslint-disable-line

import factory from '../source';

import {
	runTimes,
	virtualModule,
	StatelessWrapper // eslint-disable-line no-unused-vars
} from './_helpers';

import * as mocks from './_mocks';
import './_env';

const expect = unexpected.clone()
	.use(unexpectedReact);

test.beforeEach(t => {
	t.context.transform = factory(mocks.application);
});

test('it should export a function as default', t => {
	const actual = typeof factory;
	const expected = 'function';
	t.deepEqual(actual, expected);
});

test('calling the function should return a function', t => {
	const actual = typeof factory(mocks.application);
	const expected = 'function';
	t.deepEqual(actual, expected);
});

test('calling the returned function should return a promise', t => {
	const {context: {transform}} = t;
	const actual = transform(mocks.emptyFile).constructor.name;
	const expected = 'Promise';
	t.deepEqual(actual, expected);
});

test('the returned promise should resolve to an object', async t => {
	const {context: {transform}} = t;
	const actual = Object.prototype.toString(await transform(mocks.emptyFile));
	const expected = '[object Object]';
	t.deepEqual(actual, expected);
});

test('the resolved object should havea a buffer key', async t => {
	const {context: {transform}} = t;
	const file = await transform(mocks.emptyFile);
	t.truthy(file.hasOwnProperty('buffer'));
});

test('when transforming plain jsx', async t => {
	const {context: {transform}} = t;
	const result = await transform(mocks.plainFile);

	{
		const Actual = virtualModule(result.buffer);
		t.falsy(new Actual() instanceof Actual, 'it should return a function');
	}

	{
		const Component = virtualModule(result.buffer); // eslint-disable-line no-unused-vars
		const actual = ReactTestUtils.renderIntoDocument(
			<StatelessWrapper><Component/></StatelessWrapper>
		);
		const expected = <div></div>;
		expect(actual, 'to have rendered', expected);
	}
});

test('when transforming a react stateless component', async t => {
	const {context: {transform}} = t;
	const result = await transform(mocks.statelessFile);

	{
		const Actual = virtualModule(result.buffer);
		t.falsy(new Actual() instanceof Actual, 'it should return a function');
	}

	{
		const Component = virtualModule(result.buffer); // eslint-disable-line no-unused-vars
		const actual = ReactTestUtils.renderIntoDocument(
			<StatelessWrapper><Component/></StatelessWrapper>
		);
		const expected = <div></div>;
		expect(actual, 'to have rendered', expected);
	}

	{
		const Component = virtualModule(result.buffer); // eslint-disable-line no-unused-vars
		const actual = ReactTestUtils.renderIntoDocument(
			<StatelessWrapper><Component/></StatelessWrapper>
		);
		const expected = <div></div>;
		expect(actual, 'to have rendered', expected);
	}
});

test('when transforming a react class declaration', async t => {
	const {context: {transform}} = t;
	const result = await transform(mocks.fullFile);

	{
		const Actual = virtualModule(result.buffer);
		t.truthy(new Actual() instanceof Actual, 'it should return a class');
	}

	{
		const Component = virtualModule(result.buffer); // eslint-disable-line no-unused-vars
		const actual = ReactTestUtils.renderIntoDocument(<Component />);
		const expected = <div></div>;
		expect(actual, 'to have rendered', expected);
	}
});

test('when transforming invalid plain jsx', t => {
	const {context: {transform}} = t;
	const execution = transform(mocks.plainAsiFile);
	t.throws(execution, Error, 'it should fail');
});

test(
	'when transforming plain jsx with variable declaration "props"',
	async t => {
		const {context: {transform}} = t;
		const result = await transform(mocks.reservedPropsDeclaration);

		{
			const Actual = virtualModule(result.buffer);
			t.truthy(new Actual() instanceof Actual, 'it should return a class');
		}

		{
			const Component = virtualModule(result.buffer); // eslint-disable-line no-unused-vars
			const props = {id: 'foo', className: 'baz'};
			const actual = ReactTestUtils.renderIntoDocument(<Component {...props}/>);
			const expected = <div id="foo" className="bar">foo</div>;
			expect(actual, 'to have rendered', expected);
		}
	}
);

test(
	'when transforming plain jsx with variable declaration "context"',
	async t => {
		const {context: {transform}} = t;
		const result = await transform(mocks.reservedContextDeclaration);

		{
			const Actual = virtualModule(result.buffer);
			t.truthy(new Actual() instanceof Actual, 'it should return a class');
		}

		{
			const Component = virtualModule(result.buffer); // eslint-disable-line no-unused-vars
			const props = {id: 'foo', className: 'baz'};
			const actual = ReactTestUtils.renderIntoDocument(<Component {...props}/>);
			const expected = <div id="foo" className="bar">foo</div>;
			expect(actual, 'to have rendered', expected);
		}
	}
);

test(
	'when transforming plain jsx with member expressions to "this"',
	async t => {
		const {context: {transform}} = t;
		const result = await transform(mocks.plainThis);

		{
			const Component = virtualModule(result.buffer); // eslint-disable-line no-unused-vars
			const props = {
				foo: {id: 'bar', children: 'bar'},
				id: 'foo', children: 'foo'
			};
			const actual = ReactTestUtils.renderIntoDocument(
				<StatelessWrapper>
					<Component {...props}>foo</Component>
				</StatelessWrapper>
			);
			const expected = <div id="foo">foo<div id="bar">bar</div></div>;
			expect(actual, 'to have rendered', expected);
		}
	}
);

test(
	[
		'when transforming plain jsx with a conflicting variable declarator to a',
		'stateless component'
	].join(' '),
	t => {
		const {context: {transform}} = t;
		const execution = transform(mocks.variableDeclarator);
		t.notThrows(execution, 'it should not fail');
	}
);

test(
	[
		'when transforming plain jsx with a conflicting function declarator to a',
		'stateless component'
	].join(' '),
	t => {
		const {context: {transform}} = t;
		const execution = transform(mocks.functionDeclarator);
		t.notThrows(execution, 'it should not fail');
	}
);

test(
	[
		'when transforming plain jsx with a conflicting class declarator to a',
		'stateless component'
	].join(' '),
	t => {
		const {context: {transform}} = t;
		const execution = transform(mocks.classDeclarator);
		t.notThrows(execution, 'it should not fail');
	}
);

test(
	'when transforming plain jsx with implicit dependencies',
	async t => {
		const {context: {transform}} = t;
		const execution = transform(mocks.implicitDependencies);

		t.notThrows(execution, 'it should not fail');

		{
			const expected = ['react'];
			const {meta: {dependencies: actual}} = await execution;
			expect(actual, 'to equal', expected);
		}
	}
);

test(
	'when transforming plain jsx with implicit missing dependencies',
	async t => {
		const {context: {transform}} = t;
		const execution = transform(mocks.missingDependencies);
		t.throws(execution, Error, 'it should fail');
	}
);

test(
	'when running the transform multiple times on the same file',
	async t => {
		const {context: {transform}} = t;

		const results = await runTimes(transform, 10, mocks.implicitDependencies);
		const actual = uniqBy(results, 'buffer').length;
		const expected = 1;
		t.is(actual, expected, 'the buffer should not change');
	}
);

test(
	'when transforming a file with explicit dependencies',
	async t => {
		const {context: {transform}} = t;
		const execution = transform(mocks.explicitDependencies);

		const expected = ['react', 'lodash'];
		const unwanted = 'lodash/fp';
		const {meta: {dependencies: actual}} = await execution;

		expect(actual, 'to contain', ...expected);
		expect(actual, 'not to contain', unwanted);
	}
);
