import chalk from 'chalk';
import {oneLine, stripIndents} from 'common-tags';
import {highlight} from 'emphasize';
import {values} from 'lodash';

const deprecation = chalk.yellow('[ ⚠  Deprecation ⚠ ]');

/**
 * Log a deprecation warning about implicit dependencies
 * @param  {Object} application to log on
 */
export default (application, file, registry) => {
	const names = values(registry);

	const subject = oneLine`
		Found ${names.length} implicit imports in ${file.pattern.id}:${file.name}.
		Implicit imports are deprecated and should be replaced with explicit
		ones.
		Implicit imports will be removed in version 1.0.
	`;

	const imports = Object.entries(registry)
		.map(item => {
			const [unboundIdentifier, importName] = item;
			const name = importName === 'pattern' ?
				'Pattern' :
				importName;
			return `import ${unboundIdentifier} from '${name}';`;
		})
		.join('\n');

	const warning = stripIndents`
		${deprecation} ${subject}

		${chalk.bold(`Add the following import statements to ${file.path}:`)}

		${highlight('js', imports).value}
	`;

	application.log.warn(`${warning}\n`);
};


