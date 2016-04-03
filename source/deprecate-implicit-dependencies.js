import chalk from 'chalk';

const deprecation = chalk.yellow('[ ⚠  Deprecation ⚠ ]');

/**
 * Log a deprecation warning about implicit dependencies
 * @param  {Object} application to log on
 */
export default (application, file, registry) => {
	const names = Object.values(registry);

	application.log.warn(
		[
			deprecation,
			`Found ${names.length} implicit imports in
			${file.pattern.id}:${file.name}.`,
			`Implicit imports are deprecated and should be replaced with explicit
			ones. `,
			'Implicit imports will be removed in version 1.0. ',
			chalk.bold(`Add the following import statements to ${file.path}:`),
			'\n\n',
			Object.entries(registry)
				.map(item => {
					const [unboundIdentifier, importName] = item;
					const name = importName === 'pattern' ?
						'Pattern' :
						importName;
					return `import ${unboundIdentifier} from '${name}';`;
				}).join('\n'),
			'\n\n'
		].join('')
	);
};

module.change_code = 1; // eslint-disable-line
