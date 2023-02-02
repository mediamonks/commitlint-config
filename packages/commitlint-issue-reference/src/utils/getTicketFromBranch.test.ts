import { getIssuePattern } from './getIssuePattern.js';
import { getTicketFromBranch } from './getTicketFromBranch.js';

describe('getTicketFromBranch', () => {
  it('should return the commit from a branch', () => {
    const branch = 'feature/ABC-1234-add-some-feature';
    const commit = getTicketFromBranch(branch, getIssuePattern().branchPattern);
    expect(commit).toBe('ABC-1234');
  });

  it('should return undefined if there is no ticket in the branch', () => {
    const branch = 'feature/add-some-feature';
    const commit = getTicketFromBranch(branch, getIssuePattern().branchPattern);
    expect(commit).toBeUndefined();
  });

  it('should return the commit from a branch without a prefix', () => {
    const branch = 'ABC-1234-add-some-feature';
    const commit = getTicketFromBranch(branch, getIssuePattern().branchPattern);
    expect(commit).toBe('ABC-1234');
  });

  it('should return the commit from a branch with a github prefix', () => {
    const branch = '1234-add-some-feature';
    const commit = getTicketFromBranch(branch, getIssuePattern('#').branchPattern);
    expect(commit).toBe('1234');
  });

  it('should return the commit from a branch with custom capture group', () => {
    const branch = 'feature/1234-add-some-feature';
    const commit = getTicketFromBranch(branch, '(?:/|^)(\\d+)-');
    expect(commit).toBe('1234');
  });

  it('should return the commit from a branch with named capture group', () => {
    const branch = 'feature/1234-add-some-feature';
    const commit = getTicketFromBranch(branch, '(?:/|^)(?<issue>\\d+)-');
    expect(commit).toBe('1234');
  });
});
