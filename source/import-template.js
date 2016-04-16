import template from 'babel-template';

export default template(`const LOCAL = require(IMPORTED);`, {
	sourceType: 'module'
});

module.change_code = 1; // eslint-disable-line
