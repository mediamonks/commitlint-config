export function getIssuePattern(prefixOrRegex?: string | { commit: string; branch?: string }): {
  commitPattern: string;
  branchPattern: string;
  issuePrefix: string | undefined;
} {
  if (typeof prefixOrRegex === 'string') {
    const sanitizedPrefix = prefixOrRegex.replaceAll('#', '');

    return {
      commitPattern: new RegExp(`${prefixOrRegex}\\d+`, 'gu').source,
      branchPattern: new RegExp(`${sanitizedPrefix}\\d+`, 'gu').source,
      issuePrefix: extractIssuePrefix(prefixOrRegex, sanitizedPrefix),
    };
  }

  if (prefixOrRegex) {
    const branchPattern = prefixOrRegex.branch ?? prefixOrRegex.commit;
    return {
      commitPattern: prefixOrRegex.commit,
      branchPattern,
      issuePrefix: extractIssuePrefix(prefixOrRegex.commit, branchPattern),
    };
  }

  // return default
  const commitPattern = /[A-Z\d]+-\d+/gu.source;
  return {
    commitPattern,
    branchPattern: commitPattern,
    issuePrefix: '',
  };
}
function extractIssuePrefix(commitPrefix: string, branchPrefix: string): string | undefined {
  if (commitPrefix === branchPrefix) {
    return '';
  }

  if (commitPrefix.includes(branchPrefix)) {
    return commitPrefix.replace(branchPrefix, '');
  }

  return undefined;
}
