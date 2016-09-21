import template from 'babel-template';

export default template(`
	INJECTION;
	var global = Object.assign({}, global, IDENTIFIER);
	`,
	{
		sourceType: 'module'
	}
);


