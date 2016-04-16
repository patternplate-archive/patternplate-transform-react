import template from 'babel-template';

export default template(`
	const NAME = (props, context) => {
		AUXILIARY;
		return (JSX);
	}
`, {
	sourceType: 'module'
});

module.change_code = 1; // eslint-disable-line
