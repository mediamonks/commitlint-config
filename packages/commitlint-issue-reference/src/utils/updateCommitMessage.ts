export function removeAllIssuesFromHeader(message: string, issues: Array<string>): string {
  const [header = '', ...bodyLines] = message.split('\n');
  const body = bodyLines.join('\n');
  // eslint-disable-next-line unicorn/no-array-reduce,unicorn/no-array-callback-reference
  const updatedHeader = issues.reduce(removeIssueFromMessage, header);
  return [updatedHeader, body].filter(Boolean).join('\n');
}
export function removeIssueFromMessage(message: string, issue: string): string {
  return message.replace(new RegExp(`${issue} ?`, 'u'), '').replaceAll(/^\s+|\s+$/giu, '');
}

export function prependIssueToHeader(message: string, issue: string): string {
  return `${issue} ${message}`;
}

export function appendIssueToFooter(
  message: string,
  issue: string,
  issuesInFooter: Array<string>,
): string {
  if (issuesInFooter.length === 0) {
    return `${message}\n\n${issue}`;
  }
  return `${message} ${issue}`;
}

export function moveIssueToHeader(
  message: string,
  issue: string,
  existingHeaderIssues: Array<string>,
  existingFooterIssues: Array<string>,
): string {
  let cleanMessage = message;

  cleanMessage = removeAllIssuesFromHeader(cleanMessage, existingHeaderIssues);
  cleanMessage = removeIssueFromMessage(cleanMessage, issue);

  if (existingFooterIssues.length === 1) {
    cleanMessage = removeIssueFromMessage(cleanMessage, existingFooterIssues[0] ?? '');
  }

  return prependIssueToHeader(cleanMessage, issue);
}

export function moveIssueToFooter(
  message: string,
  issue: string,
  existingFooterIssues: Array<string>,
): string {
  let cleanMessage = message;

  cleanMessage = removeIssueFromMessage(cleanMessage, issue);

  return appendIssueToFooter(cleanMessage, issue, existingFooterIssues);
}

export function addIssueToFooter(
  message: string,
  issue: string,
  existingHeaderIssues: Array<string>,
  existingFooterIssues: Array<string>,
): string {
  let cleanMessage = message;

  cleanMessage = removeAllIssuesFromHeader(cleanMessage, existingHeaderIssues);
  cleanMessage = removeIssueFromMessage(cleanMessage, issue);

  if (existingFooterIssues.length === 1) {
    cleanMessage = removeIssueFromMessage(cleanMessage, existingFooterIssues[0] ?? '');
    // eslint-disable-next-line no-param-reassign
    existingFooterIssues = [];
  }

  return appendIssueToFooter(cleanMessage, issue, existingFooterIssues);
}
