# @mediamonks/commitlint-config

Set some basic conventions and rules for our commit messages using
[commitlint](https://commitlint.js.org/).

Note that we have not enabled the `type` and `scope` rules that are "conventional", because we don't
use them. It just focuses on the basics outlined in this [article](https://cbea.ms/git-commit/) on
how to write good commit messages.

## Installation

### Install `@commitlint/cli` and `@mediamonks/commitlint-config`

```shell
npm i -D @commitlint/cli @mediamonks/commitlint-config
```

### Create your configuration

This can be added in a lot of places
([see docs](https://commitlint.js.org/#/guides-local-setup?id=install-commitlint)), but we recommend
the `package.json`.

```json
{
  ...
  "commitlint": {
    "extends": ["@mediamonks/commitlint-config"]
  }
}
```

### Set up husky

To make sure that your commit messages are validated when you are committing.

```shell
# Install Husky v6
npm i -D husky

# Activate hooks
npx husky install

# Add hook
npx husky add .husky/commit-msg  'npx --no -- commitlint --edit ${1}'
```

## Rules

### Errors

- Subject line must be `72` characters max
- Subject line must **start** with a `capital letter`
- Subject line must **not end** with a `period`
- There must be an `empty line` between the **subject** and the **body**
- Body must be `72` characters max per line

### Warnings

- Subject line must be `30` characters min
