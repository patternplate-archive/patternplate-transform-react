import astDependencies from 'babylon-ast-dependencies';
import nodeResolve from 'resolve';

const basedir = process.cwd();

function resolve(path, options = {basedir}) {
	return new Promise((resolver, reject) => {
		nodeResolve(path, options, (error, result) => {
			if (error) {
				return reject(error);
			}
			resolver(result);
		});
	});
}

export default async function getResolvableDependencies(ast, file) {
	return await Promise.all(astDependencies(ast)
		.map(dependency => dependency.source)
		.map(async dependencyName => {
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

			const npmResolvable = await resolve(name);

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
		}));
}

module.change_code = 1; // eslint-disable-line
