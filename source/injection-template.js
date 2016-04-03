import template from 'babel-template';

export default template(`
	INJECTION;
	var global = Object.assign({}, IDENTIFIER);
	`,
	{
		sourceType: 'module'
	}
);

module.change_code = 1; // eslint-disable-line
