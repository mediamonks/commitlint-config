import { resolve } from 'node:path';
import getStdin from 'get-stdin';
import yargs from 'yargs';
import { hideBin } from 'yargs/helpers';
import processCommitMessage, { type LintOptions } from './index.js';

// read input from stdIn and use this as message when not explicitly provided
const stdInput = await getStdin();

yargs(hideBin(process.argv))
  .usage('Usage: $0 [options]')
  .command<LintOptions>(
    ['$0'],
    'Lint commit messages, and optionally auto-fix them',
    (): void => undefined,
    (argv) => {
      if (
        processCommitMessage({
          ...argv,
          message: argv.message ?? (stdInput || undefined),
          configFile: argv.configFile ?? resolve(process.cwd(), './package.json'),
        }) === false
      ) {
        // eslint-disable-next-line unicorn/no-process-exit
        process.exit(1);
      }
    },
  )
  .example('$0 -f .git/COMMIT_EDITMSG', 'Run the command on the message about to be committed.')
  .example(
    '$0 -f .git/COMMIT_EDITMSG -c ./apps/web/package.json',
    'Explicitly pass a different path to the config file.',
  )
  .example('$0 -m "Add a commit message subject"', 'Pass an explicit commit message.')
  .example('echo "Commit message" | $0', 'Use the stdin as message to validate')
  .example('$0 -m "msg" -b "feature/ABC-123-branch-name', 'Pass an explicit branch name.')
  .example(
    '$0 -f .git/COMMIT_EDITMSG --no-auto-add',
    'Explicitly disable auto-adding the issue key.',
  )
  .example(
    '$0 -m "msg" -l footer',
    'Search for the issue keys in the commit footer instead of the default header.',
  )
  .example(
    '$0 -m "msg" -P ABC-',
    'Use the specific "ABC-" prefix instead of the default generic JIRA prefix.',
  )
  .example('$0 -m "msg" -P "#"', 'Use the specific "#" prefix for use with GitHub.')
  .example(
    '$0 -f .git/COMMIT_EDITMSG -P "#" -C "(?<issue>#\\d+):" -B "(?:^|/)(\\d+)-"',
    'Pass custom commit and branch patterns.',
  )
  .option('f', {
    alias: 'file',
    default: undefined,
    describe: 'The git commit message file.',
    type: 'string',
  })
  .option('m', {
    alias: 'message',
    default: undefined,
    describe: 'The git commit message. If not passed, it reads it from the file.',
    type: 'string',
  })
  .option('b', {
    alias: 'branch',
    default: undefined,
    describe: 'The current git branch. If not passed, it will use the current git branch.',
    type: 'string',
  })
  .option('c', {
    alias: 'configFile',
    default: undefined,
    describe:
      'The path to the config file. By default it resolves the package.json in the root of the repository.',
    type: 'string',
  })
  .option('a', {
    alias: 'auto-add',
    default: undefined,
    describe:
      'Automatically add the jira ticket number to the commit message when missing. It is not possible to automatically add it correct in all situations, there it will just show an error. Will be enabled by default when a file is passed. Will error if set to true without passing a file.',
    type: 'boolean',
  })
  .option('l', {
    alias: 'location',
    default: undefined,
    describe: 'The location of the ticket in the commit message. Default is header.',
    type: 'string',
    choices: ['header', 'footer'],
  })
  .option('P', {
    alias: 'issue-prefix',
    default: undefined,
    describe:
      'The prefix for the issue number, like "ABC-" or "#". Becomes required when passed issue patterns that are different.',
    type: 'string',
  })
  .option('C', {
    alias: 'issue-commit-pattern',
    default: undefined,
    describe: 'A regexp pattern to match the commit message against.',
    type: 'string',
  })
  .option('B', {
    alias: 'issue-branch-pattern',
    default: undefined,
    describe:
      'A regexp pattern to match the branch name against. When not passed, it will use the issue-commit-pattern. When passed and different, it will be required to pass an issue-prefix.',
    type: 'string',
  })
  .option('d', {
    alias: 'debug',
    default: undefined,
    describe: 'Show debug information',
    type: 'boolean',
  })
  .help()
  .version(false)
  .wrap(Math.min(120, yargs(hideBin(process.argv)).terminalWidth()))
  .parse();
