# commitlint-issue-reference

A CLI and API tool to validate and update your commit messages with the issue number from the branch
name.

It will:

- extract the issue number from the branch name
- validate that the issue number is present in the commit message
- validate that the issue number is in the correct location in the commit message
- automatically add the issue number to the commit message if possible

When added as a pre-commit hook, it will abort the commit if the commit message is invalid.

## Getting started

### Installing

Add `@mediamonks/commitlint-issue-reference` to your project:

```sh
npm i -D @mediamonks/commitlint-issue-reference
```

#### Set up with Husky

```shell
# Install Husky
npm i -D husky

# Activate hooks
npx husky install

# Add `commit-msg` hook
npx husky add .husky/commit-msg  'npx --no -- commitlint-issue-reference --file ${1} -P "ABC-"'
```

### Usage

Use the CLI:

```shell
commitlint-issue-reference -f .git/COMMIT_EDITMSG
```

Or the API:

```tsx
import lint from '@mediamonks/commitlint-issue-reference';

lint({
  file: '.git/COMMIT_EDITMSG',
  message: 'My commit message',
  branch: 'feature/ABC-123',
  autoAdd: true,
  location: 'header',
  issuePrefix: '#', // or `ABC-`
  issueCommitPattern: '(?<issue>#\\d+):',
  issueBranchPattern: '(?:^|/)(\\d+)-',
});
```

## Options

### File

- CLI: `-f, --file`
- API: `file`
- Type: `string`
- Default: `undefined`

The file to read the commit message from. Often this is `.git/COMMIT_EDITMSG`.

When `--auto-add` is turned on, it will automatically add the issue number to the commit message in
some cases.

### Message

- CLI: `-m, --message`
- API: `message`
- Type: `string`
- Default: `undefined`

The commit message. If not passed, it will read it from the `file` or `stdin`.

### Branch

- CLI: `-b, --branch`
- API: `branch`
- Type: `string`
- Default: The current git branch.

The current git branch. If not passed, it will use the current git branch.

### Auto add

- CLI: `-a, --auto-add`
- API: `autoAdd`
- Type: `boolean`
- Default: `true` if `file` is passed, `false` otherwise.

Automatically add the issue number to the commit message. in situations where it is possible to do
so without breaking the commit message.

When it is not possible to automatically add it, it will just show an error so you can fix it
manually.

When `true` is passed without passing a `file`, it will throw an error, since it doesn't know where
to add the issue number.

### Location

- CLI: `-l, --location`
- API: `location`
- Type: `header` | `footer`
- Default: `header`

The location of the issue number in the commit message.

- `header` – The first line of the commit message.
- `footer` – The last line of the commit message.

```
<header>

<body>

<footer>
```

### Issue prefix

- CLI: `-P, --issue-prefix`
- API: `issuePrefix`
- Type: `string`
- Default: `undefined`

The prefix to be added to the issue number in the commit message. For example `ABC-` or `#`.

The `issuePrefix` can be used for simple matching of the issue number in the commit message, without
requiring any specific validation of how/where it appears in the branch name or commit message.

When only the `issuePrefix` is passed, it creates two patterns to match the issue number in the
branch name and commit message by adding a simple `\d+` pattern after the prefix. For the branch
pattern, it will first remove any special characters from the prefix (like the `#`).

#### Working together with `issueCommitPattern`

When only `issueCommitPattern` is passed, but not `branchCommitPattern`, the `issuePrefix` is not
needed, since the same regex can be used for both the branch and commit message.

When both `issueCommitPattern` and `branchCommitPattern` are passed, and the `branchCommitPattern`
is included in the `issueCommitPattern`, the `issuePrefix` is automatically generated based on the
difference between the two patterns.

For example:

- `issueCommitPattern`: `#\\d+`
- `branchCommitPattern`: `\\d+`
- will automatically generate `issuePrefix` of `'#'`

However, when this prefix cannot be automagically generated, it will throw an error if the
`issuePrefix` is not passed. In that case you can pass the `issuePrefix` manually. The value might
be just an empty string in some cases.

(?<issue>#\\d+):" -B "(?:^|/)(\\d+)- For example:

- `issueCommitPattern`: `^(?<issue>ABC-\\d+):`
- `branchCommitPattern`: `(?:^|/)(ABC-\\d+)-`
- should pass `issuePrefix` of `''`.

This is because both patterns will match the same issue number, but the patterns are different, so
the `issuePrefix` cannot be generated automatically.

### Issue commit pattern

- CLI: `-C, --issue-commit-pattern`
- API: `issueCommitPattern`
- Type: `string`
- Default: `[A-Z\\d]+-\\d+`

The pattern to match the issue key(s) inside the commit message.

By default it uses the jira issue pattern, that for example matches `ABC-123`.

To extract the issue number from the regex match, we fall back to 3 different methods to allow you
convenience and control.

1. `^(?<issue>#\\d+):` – A pattern with a named group will use the named group `issue` as the issue
   number.
2. `^(#\\d+):` – A pattern with a numbered group will use the first capture group as the issue
   number.
3. `#\\d+` – A pattern without groups will use the full match as the issue number.

The patterns are not only meant to extract the issue itself, but also to specify where/how it should
appear in the branch name or commit message. For example, the pattern `^(?<issue>#\\d+):` will only
match the issue number if it is at the start of the commit message, and followed by a colon.

### Issue branch pattern

- CLI: `-B, --issue-branch-pattern`
- API: `issueBranchPattern`
- Type: `string`
- Default: `undefined`, or the same as `issueCommitPattern` when passed.

The pattern to extract the issue number from the branch name.

When passed but different from the `issueCommitPattern`, it might be needed to also pass the
`issuePrefix`. Read more in that section.

There are two common use cases for this:

1. When the issue number in the commit message contains special characters like `#`, those
   characters will be stripped from the branch name. For example, the issue `#123` often appears in
   a branch name as `feature/123-some-feature`. When the issue number is extracted from the branch
   name, it will be `123` instead of `#123`.

2. When wanting more control over where the issue number is located in the branch name. For example,
   the issue `ABC-123` often appears in a branch name as `feature/ABC-123-some-feature`. Using a
   pattern like `(?:^|/)(?<issue>ABC-\\d+)-` it will make sure the issue number is located at the
   start of a branch segment, and is followed up by the actual name of the branch.

In the first scenario, the issue from the branch name will miss the `#`, so we need to add it back
after extracting it from the branch name. This is done by passing the `issuePrefix` option.

In the second scenario, the issue from the branch name will be `ABCC-123`, and doesn't need any
prefix, so we can pass an empty string as the `issuePrefix`.

## Examples

Run the command on the message about to be committed:

```shell
commitlint-issue-reference -f .git/COMMIT_EDITMSG
```

Pass an explicit commit message:

```shell
commitlint-issue-reference -m "Add a commit message subject"
```

Use the stdin as message to validate:

```shell
echo "Commit message" | commitlint-issue-reference
```

Pass an explicit branch name:

```shell
commitlint-issue-reference -m "msg" -b "feature/ABC-123-branch-name"
```

Explicitly disable auto-adding the issue key:

```shell
commitlint-issue-reference -f .git/COMMIT_EDITMSG --no-auto-add
```

Search for the issue keys in the commit footer instead of the default header:

```shell
commitlint-issue-reference -m "msg" -l footer
```

Use the specific "ABC-" prefix instead of the default generic JIRA prefix:

```shell
commitlint-issue-reference -m "msg" -P "ABC-"
```

Pass custom commit and branch patterns.

This will match:

- branch names like `feature/123-branch-name`
- commit messages like `#123: Add a commit message subject`

```shell
commitlint-issue-reference -m "msg" -P "#" -C "(?<issue>#\\d+):" -B "(?:^|/)(\\d+)-"
```

## Contributing

See [CONTRIBUTING.md](CONTRIBUTING.md).

## License

MIT © [Media.Monks](https://media.monks.com)
