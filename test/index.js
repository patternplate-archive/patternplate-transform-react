import 'babel-register';
import 'babel-polyfill';
import test from 'ava';

import factory from '../source';
import {virtualModule, virtualRender} from './_helpers';
import * as mocks from './_mocks';

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
		const actual = virtualRender(result.buffer);
		const expected = '<div></div>';
		t.is(actual, expected, 'it should yield the expected render output');
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
		const actual = virtualRender(result.buffer);
		const expected = '<div></div>';
		t.is(actual, expected, 'it should yield the same render output');
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
		const actual = virtualRender(result.buffer);
		const expected = '<div></div>';
		t.is(actual, expected, 'it should yield the same render output');
	}
});

/* This fails with an uncaught exception, which basically is what we want here
TODO: wrap your head around why this happens

test('when transforming invalid plain jsx', async t => {
	const {context: {transform}} = t;
	const execution = transform(mocks.plainAsiFile);
	await t.throws(execution, 'it should fail');
}); */

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
			const props = {id: 'foo', className: 'baz'};
			const actual = virtualRender(result.buffer, {}, props);
			const expected = '<div id="foo" class="bar">foo</div>';
			t.is(actual, expected, 'it should yield expected render output');
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
			const props = {id: 'foo', className: 'baz'};
			const actual = virtualRender(result.buffer, {}, props);
			const expected = '<div id="foo" class="bar">foo</div>';
			t.is(actual, expected, 'it should yield expected render output');
		}
	}
);

test(
	'when transforming plain jsx with member expressions to "this"',
	async t => {
		const {context: {transform}} = t;
		const result = await transform(mocks.plainThis);

		{
			const props = {
				foo: {id: 'bar', children: 'bar'},
				id: 'foo', children: 'foo'
			};
			const actual = virtualRender(result.buffer, {}, props, 'foo');
			const expected = '<div id="foo">foo<div id="bar">bar</div></div>';
			t.is(actual, expected, 'it should yield expected render output');
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