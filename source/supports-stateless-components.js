import compareSemver from 'compare-semver';

export default function supportsStatelessComponents(React) {
	return compareSemver.gt(React.version, ['0.13.3']);
}

module.change_code = 1; // eslint-disable-line
