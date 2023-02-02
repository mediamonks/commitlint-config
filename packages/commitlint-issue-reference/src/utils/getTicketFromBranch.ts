export function getTicketFromBranch(branch: string, issuePattern: string): string | undefined {
  const issueInBranchRegex = new RegExp(issuePattern, 'gu');
  const issueInBranchResult = issueInBranchRegex.exec(branch);

  return issueInBranchResult?.groups?.issue ?? issueInBranchResult?.[1] ?? issueInBranchResult?.[0];
}
