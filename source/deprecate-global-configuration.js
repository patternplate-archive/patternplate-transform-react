import chalk from 'chalk';
import unindent from 'unindent';

const deprecation = chalk.yellow('[ ⚠  Deprecation ⚠ ]');

function pretty(data, strip = false) {
	return JSON
		.stringify(data, null, '')
		.replace(/\"/g, strip ? '' : '\'');
}

/**
 * Log a deprecation warning about global configuration
 * @param  {Object} application to log on
 */
export default (application, file, globals) => {
	const types = Object.entries(globals)
		.reduce((registry, entry) => {
			const [propertyName, propertyValue] = entry;
			return {
				...registry,
				[propertyName]: `types.${typeof propertyValue}`
			};
		}, {});

	/* eslint-disable max-len */
	const message = [
		chalk.yellow(`${deprecation} Found "global" configuration for`,
		`${file.pattern.id}:${file.name}.\n`),
		`\n`,
		`  ${chalk.yellow('Global configuration for')}`,
		` ${chalk.yellow('transform "react" and will be removed with version "1.0.0".')}\n`,
		`  ${chalk.yellow('Replace the configuration with a <Root /> pattern providing React context.')}\n`,
		`  See ${chalk.bold('https://facebook.github.io/react/docs/context.html')} for reference.\n`,
		`  \n`,
		`  ${chalk.grey('// e.g. patterns/habitats/root/index.jsx')}\n`,
		`  import React, {PropTypes as types} from 'react';\n`,
		`  \n`,
		`  export default class Root extends React.Component {\n`,
		`    static childContextTypes = {\n`,
		`      return ${pretty(types, true)}\n`,
		`    };\n`,
		`  \n`,
		`    getChildContext() {\n`,
		`      return ${pretty(globals)}\n`,
		`    }\n`,
		`  }\n`,
		`  \n`,
		`  ${chalk.grey('// Usage')}\n`,
		`  import React, {PropTypes as types} from 'react';\n`,
		`  \n`,
		`  export default class Root extends React.Component {\n`,
		`    static contextTypes = {\n`,
		`      return ${pretty(types, true)}\n`,
		`    };\n`,
		`  \n`,
		`    render() {\n`,
		`      console.log(this.context); ${chalk.grey(`// => ${pretty(globals)}`)}\n`,
		`      return <div />;\n`,
		`    }\n`,
		`  }\n`,
		`  \n`
	].join('');

	application.log.warn(unindent(message));
};

module.change_code = 1; // eslint-disable-line
