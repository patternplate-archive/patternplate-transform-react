import template from 'babel-template';

export default template(`var LOCAL = require(IMPORTED);`, {
	sourceType: 'module'
});
