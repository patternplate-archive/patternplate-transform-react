export type Application = {
	cache: {
		set: () => void,
		get: () => any
	},
	log: {
		warn: () => void
	},
	configuration: {
		transforms: {
			[key: string]: {}
		}
	}
};

export type File = {
	buffer: Buffer,
	source: Buffer,
	dependencies: {
		[key: string]: File
	},
	meta: {
		[key: string]: any
	}
};

export type Transform = (
	file: File,
	configuration: Application.configuration
) => Promise<File>;
