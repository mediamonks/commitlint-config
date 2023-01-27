# Contributing

## Development

```shell
npm install # to install all dependencies
npm run test # to run tests
npm run test -- --watch # to develop while running tests
npm run dev # to run full examples
npm run dev:cli # to compile in watch mode, so he cli can be tested
npm run typecheck # to check types in the project
npm run lint # to run eslint
npm run fix # to fix eslint errors
npm run format # to run prettier
npm run build # create a build in the dist folder
```

When using `npm run dev:cli`, you can run the cli from the root of the project:

```shell
node ./dist/cli.js -m "msg" -b "feature/ABC-123-branch-name"
```

**Husky** and **lint-staged** are set up to run before every commit, so you don't have to worry
about formatting or linting.

## Publishing

### GitHub Actions

We are using GitHub Actions to build & publish the package to NPM. The workflow is triggered
manually from the GitHub Actions tab. There you will be able to select a npm version update type
(`patch`, `minor`, `major`) and a release type (`rc`, `beta`, `alpha`).

The GitHub Action does the version update, tagging, and committing as part of the workflow. The way
the version number is retrieved from the `package.json` after updating it.

### Manual

Run `npm publish`, which will automatically create a build.

```sh
npm publish
```
