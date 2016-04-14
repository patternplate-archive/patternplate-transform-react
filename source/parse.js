import frame from 'babel-code-frame';
import traverse from 'babel-traverse';
import {parse} from 'babylon';

const settings = {
	allowImportExportEverywhere: true,
	allowReturnOutsideFunction: true,
	sourceType: 'module',
	plugins: [
		'jsx',
		'asyncFunctions',
		'classConstructorCall',
		'doExpressions',
		'trailingFunctionCommas',
		'objectRestSpread',
		'decorators',
		'classProperties',
		'exportExtensions',
		'exponentiationOperator',
		'asyncGenerators',
		'functionBind',
		'functionSent'
	]
};

function partialParse(source: string, {line}) {
	if (source.length === 0) {
		return null;
	}

	const partial = source
		.split('\n')
		.slice(0, line - 1)
		.join('\n');

	try {
		return parse(partial, settings);
	} catch (error) {
		partialParse(source, error.loc);
	}
}

function getLastStatement(ast) {
	const statements = [];

	traverse(ast, {
		Statement: {
			exit({node}) {
				statements.push(node);
			}
		}
	});

	return statements[statements.length - 1];
}

function getAsiError(error, source: string) {
	if (typeof error.loc === 'undefined') {
		return error;
	}

	const partialAst = partialParse(source, error.loc);

	if (partialAst === null) {
		return error;
	}

	const lastStatement = getLastStatement(partialAst);

	if (lastStatement === null) {
		return error;
	}

	error.asi = true;
	error.loc = lastStatement.loc.end;
	error.loc.column += 1;
	error.message = [
		`Detected possible missing semi-colon before plain jsx block:`,
		``,
		error.message
	].join('\n');

	return error;
}

export default (source: string) => {
	try {
		return parse(source, settings);
	} catch (error) {
		const augmentedError = getAsiError(error, source);

		if (augmentedError.loc) {
			const {line, column} = error.loc;
			const lines = source.split('\n');

			error.message = [
				error.message,
				'',
				frame(source, line, column, {
					highlightCode: true
				}),
				'',
				augmentedError.asi &&
					[
						`You can fix this by adding a semi-colon at line ${line}:`,
						`${lines[line - 1]};`,
						``,
						`or wrapping jsx in parenthesis, e.g.:`,
						`(<div />)`,
						``
					].join('\n')
			].join('\n');
		}
		throw error;
	}
};

module.change_code = 1; // eslint-disable-line
