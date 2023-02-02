import processCommitMessage from './index.js';

describe('The "processCommitMessage" function', () => {
  it('should not throw', () => {
    expect(() => {
      processCommitMessage({ file: '../../.git/COMMIT_EDITMSG' });
    }).not.toThrow();
  });

  it('should exit on invalid commit', () => {
    // should not throw an error when called
    expect(
      processCommitMessage({
        message: 'Something wrong',
        branch: 'feature/SKCP3-117-c414-board-of-directors',
      }),
    ).toBeFalsy();
  });

  it('should skip generated commits', () => {
    // should not throw an error when called
    expect(
      processCommitMessage({
        message: 'Merge develop into feature/SKCP3-117-c414-board-of-directors',
        branch: 'feature/SKCP3-117-c414-board-of-directors',
      }),
    ).toBeTruthy();
  });
});
