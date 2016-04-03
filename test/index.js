import 'babel-register';
import 'babel-polyfill';
import test from 'ava';

import factory from '../source';
import * as mocks from './_mocks';

test.beforeEach(t => {
	t.context.transform = factory(mocks.application);
});

test('it should export a function as default', t => {
	const actual = typeof factory;
	const expected = 'function';
	t.same(actual, expected);
});

test('calling the function should return a function', t => {
	const actual = typeof factory(mocks.application);
	const expected = 'function';
	t.same(actual, expected);
});

test('calling the returned function should return a promise', t => {
	const {context: {transform}} = t;
	const actual = transform(mocks.emptyFile).constructor.name;
	const expected = 'Promise';
	t.same(actual, expected);
});

test('the returned promise should resolve to an object', async t => {
	const {context: {transform}} = t;
	const actual = Object.prototype.toString(await transform(mocks.emptyFile));
	const expected = '[object Object]';
	t.same(actual, expected);
});

test('the resolved object should have buffer key', async t => {
	const {context: {transform}} = t;
	const file = await transform(mocks.emptyFile);
	t.ok(file.hasOwnProperty('buffer'));
});
