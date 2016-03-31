import astDependencies from 'babylon-ast-dependencies';
import {resolve} from 'try-require';

export default function getResolvableDependencies(ast, file) {
	return astDependencies(ast)
		.map(dependency => dependency.source)
		.map(dependencyName => {
			const name = dependencyName === 'pattern' ?
				'Pattern' :
				dependencyName;

			const indexDependencies = file.dependencies.Pattern ?
				file.dependencies.Pattern :
				{};

			const resolveable = name in file.dependencies ||
				name in indexDependencies;

			if (resolveable) {
				return name;
			}

			const npmResolvable = resolve(name);

			if (npmResolvable) {
				file.meta.dependencies.push(name);
				return name;
			}

			const err = new Error([
				`Could not resolve dependency ${name}`,
				`in ${file.pattern.id}:${file.name},`,
				'it is not in pattern.json and could not be loaded from npm.',
				'Available pattern dependencies:',
				Object.keys(file.dependencies).join(', ')
			].join(' '));

			err.fileName = file.path;
			err.file = file.path;
			throw err;
		});
}
