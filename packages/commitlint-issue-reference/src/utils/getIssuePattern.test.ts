import { getIssuePattern } from './getIssuePattern.js';

describe('getIssuePattern', () => {
  it('should return the default issue pattern', () => {
    const issuePattern = getIssuePattern();
    expect(issuePattern).toStrictEqual({
      commitPattern: '[A-Z\\d]+-\\d+',
      branchPattern: '[A-Z\\d]+-\\d+',
      issuePrefix: '',
    });
  });

  it('should return the issue pattern with the Jira issue prefix', () => {
    const issuePattern = getIssuePattern('ABC-');
    expect(issuePattern).toStrictEqual({
      commitPattern: 'ABC-\\d+',
      branchPattern: 'ABC-\\d+',
      issuePrefix: '',
    });
  });

  it('should return the issue pattern with the GitHub issue prefix', () => {
    const issuePattern = getIssuePattern('#');
    expect(issuePattern).toStrictEqual({
      commitPattern: '#\\d+',
      branchPattern: '\\d+',
      issuePrefix: '#',
    });
  });

  it('should return the issue pattern with the custom regex', () => {
    const issuePattern = getIssuePattern({ commit: 'ABC-\\d+', branch: 'ABC-\\d+' });
    expect(issuePattern).toStrictEqual({
      commitPattern: 'ABC-\\d+',
      branchPattern: 'ABC-\\d+',
      issuePrefix: '',
    });
  });

  it('should return the issue pattern with the custom regex', () => {
    const issuePattern = getIssuePattern({ commit: '#\\d+', branch: '\\d+' });
    expect(issuePattern).toStrictEqual({
      commitPattern: '#\\d+',
      branchPattern: '\\d+',
      issuePrefix: '#',
    });
  });

  it('should return the issue pattern with complex patterns', () => {
    const issuePattern = getIssuePattern({
      commit: '^^(?<issue>#\\d+)s',
      branch: '(?:^|/)(?<issue>\\d+)-',
    });
    expect(issuePattern).toStrictEqual({
      commitPattern: '^^(?<issue>#\\d+)s',
      branchPattern: '(?:^|/)(?<issue>\\d+)-',
      issuePrefix: undefined,
    });
  });
});
