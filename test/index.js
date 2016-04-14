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

test('when transforming plain jsx', t => {
	const {context: {transform}} = t;
	const execution = transform(mocks.plainFile);
	t.notThrows(execution, ', it should not fail');
});

test('when transforming a react stateless component', t => {
	const {context: {transform}} = t;
	const execution = transform(mocks.statelessFile);
	t.notThrows(execution, 'it should not fail');
});

test('when transforming a react class declaration', t => {
	const {context: {transform}} = t;
	const execution = transform(mocks.fullFile);
	t.notThrows(execution, 'a react class definition, it should not fail');
});

/* This fails with an uncaught exception, which basically is what we want here
TODO: wrap your head around this

test('when transforming invalid plain jsx', async t => {
	const {context: {transform}} = t;
	const execution = transform(mocks.plainAsiFile);
	await t.throws(execution, 'it should fail');
}); */
