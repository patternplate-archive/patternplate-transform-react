import classTemplate from './class-template';
import functionTemplate from './function-template';

/**
 * Get babel-ast template for React component
 * @param  {Object} React React library export
 * @return {Object}       babel-ast template
 */
export default function getComponentTemplate({stateless}) {
	return stateless ?
		functionTemplate :
		classTemplate;
}

module.change_code = 1; // eslint-disable-line
