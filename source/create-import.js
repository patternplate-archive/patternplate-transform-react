import * as t from 'babel-types';

export default createImport;

function createImport(specName, sourceName) {
	const ident = t.identifier(specName);
	const spec = t.importDefaultSpecifier(ident);
	const source = t.stringLiteral(sourceName);
	return t.importDeclaration([spec], source);
}
