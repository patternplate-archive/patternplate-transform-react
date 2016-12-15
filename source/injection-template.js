import template from 'babel-template';

export default template(`
	INJECTION;
	var global = {};

	for (var key in IDENTIFIER) {
		if ({}.hasOwnProperty.call(IDENTIFIER, key)) {
			global[key] = IDENTIFIER[key];
		}
	}
	`,
	{
		sourceType: 'module'
	}
);
