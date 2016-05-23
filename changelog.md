<a name="0.4.2"></a>
## [0.4.2](https://github.com/sinnerschrader/patternplate-transform-react/compare/v0.4.1...v0.4.2) (2016-05-23)


### Bug Fixes

* **generation:** merge node globals into injection ([0c3852d](https://github.com/sinnerschrader/patternplate-transform-react/commit/0c3852d))



<a name="0.4.1"></a>
## [0.4.1](https://github.com/sinnerschrader/patternplate-transform-react/compare/v0.4.0...v0.4.1) (2016-05-18)




<a name="0.4.0"></a>
# [0.4.0](https://github.com/sinnerschrader/patternplate-transform-react/compare/v0.2.4...v0.4.0) (2016-05-17)


### Bug Fixes

* **detection:** resolve npm dependencies from process.cwd always ([1508540](https://github.com/sinnerschrader/patternplate-transform-react/commit/1508540))
* **generation:** honor globals in internal cache ([40c425a](https://github.com/sinnerschrader/patternplate-transform-react/commit/40c425a))

### Features

* **generation:** switch to ast based transform ([048f461](https://github.com/sinnerschrader/patternplate-transform-react/commit/048f461))



<a name="0.3.0"></a>
# [0.3.0](https://github.com/sinnerschrader/patternplate-transform-react/compare/v0.2.3...v0.3.0) (2016-04-16)
### Bug Fixes

* **detection:** avoid babylon bug by removing jsx at the end ([74a8006](https://github.com/sinnerschrader/patternplate-transform-react/commit/74a8006))
* **detection:** avoid shadowing parser errors ([795ca69](https://github.com/sinnerschrader/patternplate-transform-react/commit/795ca69))
* **detection:** check for existence of default export ([c093fcb](https://github.com/sinnerschrader/patternplate-transform-react/commit/c093fcb))
* **generation:** avoid naming collisions during transformation ([40e29b0](https://github.com/sinnerschrader/patternplate-transform-react/commit/40e29b0))
* **generation:** fix mtime lookup ([df4c8ce](https://github.com/sinnerschrader/patternplate-transform-react/commit/df4c8ce))
* **generation:** only include react import if it is missing ([244fc6c](https://github.com/sinnerschrader/patternplate-transform-react/commit/244fc6c))
* **generation:** push npm resolvable names to file dependencies ([39c138f](https://github.com/sinnerschrader/patternplate-transform-react/commit/39c138f))
* **generation:** require react on top-level ([ad35e45](https://github.com/sinnerschrader/patternplate-transform-react/commit/ad35e45))
* **generation:** rewrite props deref only for stateless components ([2e5bf3a](https://github.com/sinnerschrader/patternplate-transform-react/commit/2e5bf3a))
* **system:** add / update missing dependencies ([bd5fc13](https://github.com/sinnerschrader/patternplate-transform-react/commit/bd5fc13))

### Features

* **detection:** allow trailing function commas ([9d1804c](https://github.com/sinnerschrader/patternplate-transform-react/commit/9d1804c))
* **detection:** enhance error messages for asi errors in plain jsx ([048c407](https://github.com/sinnerschrader/patternplate-transform-react/commit/048c407))
* **detection:** resolve transitive demo dependencies properly ([e98bf39](https://github.com/sinnerschrader/patternplate-transform-react/commit/e98bf39))
* **detection:** throw better parser errors ([088d540](https://github.com/sinnerschrader/patternplate-transform-react/commit/088d540))
* **generation:** enable partial global support ([f6e72a7](https://github.com/sinnerschrader/patternplate-transform-react/commit/f6e72a7))
* **generation:** implement legacy global injection support ([1b92b54](https://github.com/sinnerschrader/patternplate-transform-react/commit/1b92b54))
* **transformation:** bootstrap ast-based react transformation ([f7f7b99](https://github.com/sinnerschrader/patternplate-transform-react/commit/f7f7b99))

<a name="0.2.4"></a>
## [0.2.4](https://github.com/sinnerschrader/patternplate-transform-react/compare/v0.2.3...v0.2.4) (2016-03-07)
### Bug Fixes

* **transformation:** avoid recursive work when converting dependencies ([f6d2b5b](https://github.com/sinnerschrader/patternplate-transform-react/commit/f6d2b5b)), closes [sinnerschrader/patternplate#34](https://github.com/sinnerschrader/patternplate/issues/34)

<a name="0.2.3"></a>
## [0.2.3](https://github.com/sinnerschrader/patternplate-transform-react/compare/v0.2.2...v0.2.3) (2016-03-03)


### Bug Fixes

* **detection:** correct implicit dependency usage detection ([a6b123a](https://github.com/sinnerschrader/patternplate-transform-react/commit/a6b123a))



<a name="0.2.2"></a>
## [0.2.2](https://github.com/sinnerschrader/patternplate-transform-react/compare/v0.2.1...v0.2.2) (2016-02-17)


### Bug Fixes

* enable named imports ([94a56a8](https://github.com/sinnerschrader/patternplate-transform-react/commit/94a56a8))



<a name="0.2.1"></a>
## [0.2.1](https://github.com/sinnerschrader/patternplate-transform-react/compare/v0.2.0...v0.2.1) (2016-02-15)


### Bug Fixes

* pass convertCode configuration correctly ([95b7896](https://github.com/sinnerschrader/patternplate-transform-react/commit/95b7896))



<a name="0.2.0"></a>
# [0.2.0](https://github.com/sinnerschrader/patternplate-transform-react/compare/v0.1.0...v0.2.0) (2016-02-15)


### Features

* add possibility to transform all dependencies ([5c655cc](https://github.com/sinnerschrader/patternplate-transform-react/commit/5c655cc))



<a name="0.1.0"></a>
# 0.1.0 (2016-02-14)


### Features

* flesh transform out into own module ([5ff80a9](https://github.com/sinnerschrader/patternplate-transform-react/commit/5ff80a9))




---
Copyright 2016 by [SinnerSchrader Deutschland GmbH](https://github.com/sinnerschrader) and [contributors](./graphs/contributors). Released under the [MIT license]('./license.md').
