import traverse from 'babel-traverse';
import createImport from './create-import';
import getImports from './get-imports';

export default ast => {
	const {identifiers} = getImports(ast);

	// Add React to imports if not imported already
	if (identifiers.includes('react') === false) {
		traverse(ast, {
			Program: {
				exit(path) {
					path.unshiftContainer('body', [
						createImport('React', 'react')
					]);
				}
			}
		});
	}
};

module.change_code = 1; // eslint-disable-line
