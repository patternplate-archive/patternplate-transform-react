import template from 'babel-template';

export default template(`
	class NAME extends React.Component {
		render() {
			AUXILIARY;
			return (JSX);
		}
	}
`, {
	sourceType: 'module'
});

module.change_code = 1; // eslint-disable-line
