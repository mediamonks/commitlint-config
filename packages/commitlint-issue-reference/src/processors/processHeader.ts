import chalk from 'chalk';
import type { IssueReferences } from '../utils/findIssueReferencesInCommit.js';
import { getErrorBlock, outputAuthAddTicket, outputError } from '../utils/outputInfo.js';
import {
  moveIssueToFooter,
  moveIssueToHeader,
  prependIssueToHeader,
} from '../utils/updateCommitMessage.js';

export function processHeader(
  issueFromBranch: string,
  issuesInCommit: IssueReferences,
  message: string,
  updateCommit: (message: string) => void,
  autoAdd = true,
): boolean | undefined {
  if (!issuesInCommit.hasCorrectAmount) {
    let expectedMessage = message;

    // move all non-matching issues to footer
    const currentFooterIssues = [...issuesInCommit.footerMatchResults.patternMatches];
    const remainingIssuesInHeader = issuesInCommit.headerMatchResults.patternMatches.filter(
      (issue) => issue !== issueFromBranch,
    );
    for (const issue of remainingIssuesInHeader) {
      expectedMessage = moveIssueToFooter(expectedMessage, issue, currentFooterIssues);
      currentFooterIssues.push(issue);
    }
    // add issue from branch to header if not already there
    if (!issuesInCommit.isFound) {
      expectedMessage = prependIssueToHeader(expectedMessage, issueFromBranch);
    }

    outputError(
      `${getErrorBlock()} The commit message header may only contain a single issue reference.
If there are more than one issue references, they should exist in the footer of the commit message.`,
      message,
      expectedMessage,
      issueFromBranch,
    );

    return false;
  }

  const defaultExpectedMessage = moveIssueToHeader(
    message,
    issueFromBranch,
    issuesInCommit.headerMatchResults.patternMatches,
    issuesInCommit.footerMatchResults.patternMatches,
  );

  if (issuesInCommit.otherIssuesFound && !issuesInCommit.isFound) {
    const allIssues = issuesInCommit.foundMatches;

    outputError(
      `${getErrorBlock()} The issue reference in the commit message does not match the issue reference in branch the name.
Found other issue reference(s) in commit message: ${chalk.blue(allIssues.join(', '))}`,
      message,
      defaultExpectedMessage,
      issueFromBranch,
    );
    return false;
  }

  if (!issuesInCommit.isFound) {
    const expectedMessage = prependIssueToHeader(message, issueFromBranch);

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
    outputError(
      `${chalk.bold.whiteBright.bgRed(
        ' Error ',
      )} The issue reference is found in the wrong location of the commit message.
Please move it to the ${chalk.bold('header')} of the commit message.`,
      message,
      defaultExpectedMessage,
      issueFromBranch,
    );

    return false;
  }

  if (!issuesInCommit.hasCorrectPosition) {
    outputError(
      `${getErrorBlock()} Found the issue reference in an invalid position of the commit message header.
The issue references should be placed at the beginning of the header.`,
      message,
      defaultExpectedMessage,
      issueFromBranch,
    );

    return false;
  }

  if (!issuesInCommit.hasCorrectFormat) {
    outputError(
      `${getErrorBlock()} The found issue reference has an invalid format.
While the issue reference is found, it doesn't match the ${chalk.blue(
        'issueCommitPattern',
      )} format.`,
      message,
      defaultExpectedMessage,
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
