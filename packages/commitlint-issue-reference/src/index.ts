/* eslint-disable no-param-reassign */
import * as childProcess from 'node:child_process';
import { readFileSync, existsSync } from 'node:fs';
import { relative } from 'node:path';
import chalk from 'chalk';
import { processFooter } from './processors/processFooter.js';
import { processHeader } from './processors/processHeader.js';
import { findIssueReferencesInCommit } from './utils/findIssueReferencesInCommit.js';
import { getIssuePattern } from './utils/getIssuePattern.js';
import { getTicketFromBranch } from './utils/getTicketFromBranch.js';
import { loadCommitMessage, saveCommitMessage } from './utils/io.js';
import { isIgnored } from './utils/isIgnored.js';
import {
  getErrorBlock,
  outputFoundTicketInBranch,
  outputNoTicketInBranch,
} from './utils/outputInfo.js';

export type LintOptions = {
  file?: string;
  message?: string;
  branch?: string;
  configFile?: string;
  autoAdd?: boolean;
  location?: 'header' | 'footer';
  issuePrefix?: string;
  issueCommitPattern?: string;
  issueBranchPattern?: string;
  debug?: boolean;
};

function getGitBranch(): string {
  const { status, stderr, stdout } = childProcess.spawnSync('git', [
    'rev-parse',
    '--abbrev-ref',
    'HEAD',
  ]);

  if (status !== 0) {
    throw new Error(stderr.toString());
  }
  return stdout.toString().trim();
}

export default function processCommitMessage({
  file,
  message,
  branch,
  configFile,
  autoAdd,
  location,
  issuePrefix,
  issueCommitPattern,
  issueBranchPattern,
  debug,
}: LintOptions): boolean | undefined {
  if (debug) {
    /* eslint-disable no-console */
    console.log(chalk.grey(`[debug] OPTIONS`));
    console.log(chalk.grey(`[debug] file: ${file}`));
    console.log(chalk.grey(`[debug] message: ${message}`));
    console.log(chalk.grey(`[debug] branch: ${branch}`));
    console.log(chalk.grey(`[debug] configFile: ${configFile}`));
    console.log(chalk.grey(`[debug] autoAdd: ${autoAdd}`));
    console.log(chalk.grey(`[debug] location: ${location}`));
    console.log(chalk.grey(`[debug] issuePrefix: ${issuePrefix}`));
    console.log(chalk.grey(`[debug] issueCommitPattern: ${issueCommitPattern}`));
    console.log(chalk.grey(`[debug] issueBranchPattern: ${issueBranchPattern}`));
    /* eslint-enable no-console */
  }

  // load config file from disk (package.json),
  // and get the configuration object from the "commitlintIssueReference" key
  if (configFile) {
    const fileDoesExist = existsSync(configFile);
    const isDefaultPath = relative(process.cwd(), configFile) === 'package.json';

    if (!fileDoesExist && !isDefaultPath) {
      // eslint-disable-next-line no-console
      console.log(
        `Error: Config file "${chalk.blue(configFile)}" does not exist.
Resolved from "${chalk.blue(process.cwd())}."`,
      );
      return false;
    }

    if (fileDoesExist) {
      const contents = readFileSync(configFile, 'utf8');
      const config = JSON.parse(contents).commitlintIssueReference ?? {};

      // set values from config file if they are not explicitly set
      location ??= config.location;
      autoAdd ??= config.autoAdd;
      issuePrefix ??= config.issuePrefix;
      issueCommitPattern ??= config.issueCommitPattern;
      issueBranchPattern ??= config.issueBranchPattern;
      debug ??= config.debug;
    }
  }

  // set default values if they have not been set
  location ??= 'header';

  if (debug) {
    /* eslint-disable no-console */
    console.log(chalk.grey(`[debug] RESOLVED`));
    console.log(chalk.grey(`[debug] autoAdd: ${autoAdd}`));
    console.log(chalk.grey(`[debug] location: ${location}`));
    console.log(chalk.grey(`[debug] issuePrefix: ${issuePrefix}`));
    console.log(chalk.grey(`[debug] issueCommitPattern: ${issueCommitPattern}`));
    console.log(chalk.grey(`[debug] issueBranchPattern: ${issueBranchPattern}`));
    /* eslint-enable no-console */
  }

  // eslint-disable-next-line @typescript-eslint/no-unnecessary-condition
  if (location !== 'header' && location !== 'footer') {
    // eslint-disable-next-line no-console
    console.log(
      `${getErrorBlock()} ${chalk.blue('location')} must be either ${chalk.blue(
        'header',
      )} or ${chalk.blue('footer')}.`,
    );
    return false;
  }

  if (!message && !file) {
    // eslint-disable-next-line no-console
    console.log(
      `${getErrorBlock()} Either ${chalk.blue('message')} or ${chalk.blue(
        'file',
      )} must be provided, otherwise there is nothing to lint.`,
    );
    return false;
  }

  if (!file) {
    if (autoAdd) {
      // eslint-disable-next-line no-console
      console.log(
        `${getErrorBlock()} ${chalk.blue('file')} must be provided when using ${chalk.blue(
          '--auto-add',
        )}.
Please do not use ${chalk.blue('--auto-add')} or provide a ${chalk.blue('file')}.`,
      );
      return false;
    }

    // explicitly disable
    autoAdd = false;
  }

  // default to true if not set
  autoAdd ??= true;

  if (!issueCommitPattern && issueBranchPattern) {
    // eslint-disable-next-line no-console
    console.log(
      `${getErrorBlock()} ${chalk.blue(
        'issueCommitPattern',
      )} must be provided when using ${chalk.blue(
        'issueBranchPattern',
      )}. If they are equal, use ${chalk.blue('issueCommitPattern')} instead.`,
    );
    return false;
  }

  // eslint-disable-next-line @typescript-eslint/no-non-null-assertion
  message ??= loadCommitMessage(file!);
  branch ??= getGitBranch();

  if (debug) {
    /* eslint-disable no-console */
    console.log(chalk.grey(`[debug] -- after --`));
    console.log(chalk.grey(`[debug] message: ${message}`));
    console.log(chalk.grey(`[debug] branch: ${branch}`));
    console.log(chalk.grey(`[debug] autoAdd: ${autoAdd}`));
    /* eslint-enable no-console */
  }

  if (isIgnored(message)) {
    // eslint-disable-next-line no-console
    console.log('This is an auto-generated commit message, skipping linting.');
    return true;
  }

  const issuePattern = getIssuePattern(
    issueCommitPattern ? { commit: issueCommitPattern, branch: issueBranchPattern } : issuePrefix,
  );
  issuePrefix ??= issuePattern.issuePrefix;

  if (issuePrefix === undefined) {
    // eslint-disable-next-line no-console
    console.log(
      `${getErrorBlock()} ${chalk.blue(
        'issuePrefix',
      )} could not be determined from the different ${chalk.blue(
        'issueCommitPattern',
      )} and ${chalk.blue(
        'issueBranchPattern',
      )}, which could result in incorrect matching. Please provide ${chalk.blue(
        'issuePrefix',
      )} explicitly.
The ${chalk.blue(
        'issuePrefix',
      )} should be defined as value being added to the beginning of the issue reference after it has been fetched from the branch name.`,
    );
    return false;
  }

  let ticketInBranch = getTicketFromBranch(branch, issuePattern.branchPattern);
  if (ticketInBranch && issuePrefix && !ticketInBranch.startsWith(issuePrefix)) {
    ticketInBranch = `${issuePrefix}${ticketInBranch}`;
  }

  if (!ticketInBranch) {
    outputNoTicketInBranch();
    return true;
  }

  outputFoundTicketInBranch(ticketInBranch);

  const issuesInCommit = findIssueReferencesInCommit(
    message,
    ticketInBranch,
    issuePattern.commitPattern,
    location,
  );

  const updateMessage = (newMessage: string): void => {
    if (file) {
      saveCommitMessage(newMessage, file);
    }
  };

  if (location === 'header') {
    return processHeader(ticketInBranch, issuesInCommit, message, updateMessage, autoAdd);
  }
  return processFooter(ticketInBranch, issuesInCommit, message, updateMessage, autoAdd);
}
