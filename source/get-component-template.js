import classTemplate from './class-template';
import functionTemplate from './function-template';
import supportsStatelessComponents from './supports-stateless-components';

/**
 * Get babel-ast template for React component
 * @param  {Object} React React library export
 * @return {Object}       babel-ast template
 */
export default function getComponentTemplate(React) {
	return supportsStatelessComponents(React) ?
		functionTemplate :
		classTemplate;
}
