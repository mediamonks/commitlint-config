import chalk from 'chalk';
import type { IssueReferences } from '../utils/findIssueReferencesInCommit.js';
import { getErrorBlock, outputAuthAddTicket, outputError } from '../utils/outputInfo.js';
import {
  addIssueToFooter,
  appendIssueToFooter,
  moveIssueToFooter,
  removeIssueFromMessage,
} from '../utils/updateCommitMessage.js';

export function processFooter(
  issueFromBranch: string,
  issuesInCommit: IssueReferences,
  message: string,
  updateCommit: (message: string) => void,
  autoAdd = true,
): boolean | undefined {
  if (issuesInCommit.otherIssuesFound && !issuesInCommit.isFound) {
    const allIssues = issuesInCommit.foundMatches;
    const expectedMessage = addIssueToFooter(
      message,
      issueFromBranch,
      issuesInCommit.headerMatchResults.patternMatches,
      issuesInCommit.footerMatchResults.patternMatches,
    );

    outputError(
      `${getErrorBlock()} The issue reference in the commit message does not match the issue reference in branch the name.
Found other issue reference(s) in commit message: ${chalk.blue(allIssues.join(', '))}`,
      message,
      expectedMessage,
      issueFromBranch,
    );
    return false;
  }

  if (!issuesInCommit.isFound) {
    const expectedMessage = appendIssueToFooter(
      message,
      issueFromBranch,
      issuesInCommit.footerMatchResults.patternMatches,
    );

    if (autoAdd) {
      outputAuthAddTicket(issueFromBranch, expectedMessage);
      updateCommit(expectedMessage);
      return true;
    }

    outputError(
      `${getErrorBlock()} Missing issue reference in commit message.
Enable the ${chalk.blue(`--auto-add`)} flag to automatically add the ticket to the commit message.`,
      message,
      expectedMessage,
      issueFromBranch,
    );

    return false;
  }

  if (!issuesInCommit.hasCorrectLocation) {
    const expectedMessage = moveIssueToFooter(
      message,
      issueFromBranch,
      issuesInCommit.footerMatchResults.patternMatches,
    );

    outputError(
      `${chalk.bold.whiteBright.bgRed(
        ' Error ',
      )} The issue reference is found in the wrong location of the commit message.
Please move it to the ${chalk.bold('footer')} of the commit message.`,
      message,
      expectedMessage,
      issueFromBranch,
    );

    return false;
  }

  if (!issuesInCommit.hasCorrectFormat) {
    const expectedMessage = appendIssueToFooter(
      removeIssueFromMessage(message, issueFromBranch),
      issueFromBranch,
      issuesInCommit.footerMatchResults.patternMatches.length === 1
        ? []
        : issuesInCommit.footerMatchResults.patternMatches,
    );

    outputError(
      `${getErrorBlock()} The found issue reference has an invalid format.
While the issue reference is found, it doesn't match the ${chalk.blue(
        'issueCommitPattern',
      )} format.`,
      message,
      expectedMessage,
      issueFromBranch,
    );

    return false;
  }

  // eslint-disable-next-line no-console
  console.log(
    'The same issue reference is also found in the commit message, so everything is fine.',
  );
  return true;
}
