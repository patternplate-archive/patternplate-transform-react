import chalk from 'chalk';
import {oneLine, stripIndent} from 'common-tags';
import {highlight} from 'emphasize';

const deprecation = chalk.yellow('[ ⚠  Deprecation ⚠ ]');
const reference = 'https://facebook.github.io/react/docs/context.html';
const removal = chalk.yellow(oneLine`Global configuration for transform
	"react" and will be removed with version "1.0.0".`);

function pretty(data, strip = false) {
	return JSON
		.stringify(data, null, '')
		.replace(/"/g, strip ? '' : '\'');
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

	const message = chalk.yellow(oneLine`${deprecation} Found "global"
		configuration for ${file.pattern.id}:${file.name}.`);

	const warning = stripIndent`
	${message} ${removal}
	Replace the configuration with a <Root /> pattern providing React context.
	See ${chalk.bold(reference)} for reference.

	  ${highlight('js', `// Example definition
	  import React, {PropTypes as types} from 'react';

	  export default class Root extends React.Component {
	    static childContextTypes = {
	      return ${pretty(types, true)}
	    };

	    getChildContext() {
	      return ${pretty(globals)}
	    }
	  }

	  // Example usage
	  import React, {PropTypes as types} from 'react';

	  export default class Root extends React.Component {
	    static contextTypes = {
	      return ${pretty(types, true)}
	    };

	    render() {
	      console.log(this.context); // => ${pretty(globals)}
	      return <div />;
	    }
	  `).value}}
	`;

	application.log.warn(warning);
};

module.change_code = 1; // eslint-disable-line
