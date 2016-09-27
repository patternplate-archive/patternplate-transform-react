import * as t from 'babel-types';
export default createExport;

function createExport(identifier) {
	return t.assignmentExpression(
		'=',
		t.memberExpression(
			t.identifier('module'),
			t.identifier('exports')
		),
		identifier
	);
}
