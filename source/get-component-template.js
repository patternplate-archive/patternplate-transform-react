import classTemplate from './class-template';
import functionTemplate from './function-template';

/**
 * Get babel-ast template for React component
 * @param  {Object} React React library export
 * @return {Object}       babel-ast template
 */
export default ({stateless}) => {
	return stateless ?
		functionTemplate :
		classTemplate;
};


