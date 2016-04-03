import frame from 'babel-code-frame';
import {parse} from 'babylon';

export default source => {
	try {
		return parse(source, {
			allowImportExportEverywhere: true,
			allowReturnOutsideFunction: true,
			sourceType: 'module',
			plugins: [
				'jsx',
				'asyncFunctions',
				'classConstructorCall',
				'objectRestSpread',
				'decorators',
				'classProperties',
				'exportExtensions',
				'exponentiationOperator',
				'asyncGenerators',
				'functionBind',
				'functionSent'
			]
		});
	} catch (error) {
		if (error.loc) {
			const {line, column} = error.loc;
			error.message = [
				error.message,
				'',
				frame(source, line, column, {
					highlightCode: true
				}),
				''
			].join('\n');
		}
		throw error;
	}
};

module.change_code = 1; // eslint-disable-line
