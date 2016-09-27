import template from 'babel-template';

export default template(`const LOCAL = require(IMPORTED);`, {
	sourceType: 'module'
});
