export type IssueReferences = {
  isFound: boolean;
  foundMatches: Array<string>;
  hasCorrectAmount: boolean;
  hasCorrectFormat: boolean;
  hasCorrectPosition: boolean | undefined;
  hasCorrectLocation: boolean;
  headerMatchResults: MatchResults;
  footerMatchResults: MatchResults;
  otherIssuesFound: boolean;
};

export type MatchResults = {
  patternMatches: Array<string>;
  branchIssueMatches: Array<string>;
  branchIssue: string | undefined;
  hasFoundIssue: boolean;
  isCorrectIssueFormat: boolean;
  otherIssuesFound: boolean;
  anyIssuesFound: boolean;
};

const findIssues = (message: string, regexp: RegExp): Array<string> =>
  [...message.matchAll(regexp)]
    .map((match) => match.groups?.issue ?? match[1] ?? match[0])
    .filter(Boolean) as Array<string>;

export function findIssueReferencesInCommit(
  message: string,
  ticketInBranch: string,
  issuePattern: string,
  expectedLocation: 'header' | 'footer',
): IssueReferences {
  const issueInCommitRegex = new RegExp(issuePattern, 'gu');

  const [header = '', ...bodyLines] = message.split('\n');
  const body = bodyLines.join('\n');

  const headerResults = findMatches(header, issueInCommitRegex, ticketInBranch);
  const bodyResults = findMatches(body, issueInCommitRegex, ticketInBranch);
  const isFound = headerResults.hasFoundIssue || bodyResults.hasFoundIssue;
  const foundMatches = [...headerResults.patternMatches, ...bodyResults.patternMatches];

  const headerIssue = headerResults.branchIssue;

  if (expectedLocation === 'header') {
    const issueOnlyFoundInBody =
      headerResults.branchIssueMatches.length === 0 && bodyResults.anyIssuesFound;
    return {
      isFound,
      foundMatches,
      hasCorrectAmount:
        headerResults.branchIssueMatches.length <= 1 && headerResults.patternMatches.length <= 1,
      hasCorrectFormat: headerResults.isCorrectIssueFormat,
      hasCorrectPosition: header.startsWith(headerIssue ?? ''),
      hasCorrectLocation: !issueOnlyFoundInBody,
      otherIssuesFound:
        headerResults.otherIssuesFound ||
        (!headerResults.hasFoundIssue && bodyResults.otherIssuesFound),
      headerMatchResults: headerResults,
      footerMatchResults: bodyResults,
    };
  }

  return {
    isFound,
    foundMatches,
    hasCorrectAmount:
      bodyResults.branchIssueMatches.length > 0 || bodyResults.patternMatches.length > 0,
    hasCorrectFormat: bodyResults.isCorrectIssueFormat,
    hasCorrectPosition: undefined,
    hasCorrectLocation:
      headerResults.branchIssueMatches.length === 0 && headerResults.patternMatches.length === 0,
    otherIssuesFound:
      bodyResults.otherIssuesFound ||
      (!bodyResults.hasFoundIssue && headerResults.otherIssuesFound),
    headerMatchResults: headerResults,
    footerMatchResults: bodyResults,
  };
}

export function findMatches(message: string, pattern: RegExp, issue: string): MatchResults {
  const patternMatches = findIssues(message, pattern);
  const branchIssueMatches = findIssues(message, new RegExp(issue, 'gu'));

  const hasFoundIssue = branchIssueMatches.length > 0;
  const branchIssue = patternMatches.find((match) => branchIssueMatches.includes(match));
  const isCorrectIssueFormat = !hasFoundIssue || Boolean(branchIssue);
  const otherIssuesFound = !branchIssue && patternMatches.length > 0;

  return {
    patternMatches,
    branchIssueMatches,
    branchIssue,
    hasFoundIssue,
    isCorrectIssueFormat,
    otherIssuesFound,
    anyIssuesFound: patternMatches.length > 0 || branchIssueMatches.length > 0,
  };
}
