import {
  removeIssueFromMessage,
  removeAllIssuesFromHeader,
  prependIssueToHeader,
  appendIssueToFooter,
  moveIssueToHeader,
  moveIssueToFooter,
  addIssueToFooter,
} from './updateCommitMessage.js';

describe('updateCommitMessage', () => {
  describe('removeIssueFromMessage', () => {
    it('should remove issue from header', () => {
      const result = removeIssueFromMessage('ABC-1234 This is commit message', 'ABC-1234');
      expect(result).toBe('This is commit message');
    });
    it('should remove issue from footer', () => {
      const result = removeIssueFromMessage('This is commit message\n\nABC-1234', 'ABC-1234');
      expect(result).toBe('This is commit message');
    });
    it('should remove issue from footer with multiple issues', () => {
      const result = removeIssueFromMessage(
        'This is commit message\n\nABC-1234 DEF-5678',
        'ABC-1234',
      );
      expect(result).toBe('This is commit message\n\nDEF-5678');
    });
  });

  describe('removeAllIssuesFromHeader', () => {
    // test
    it('should remove all issues from header', () => {
      const result = removeAllIssuesFromHeader('ABC-1234 DEF-5678 This is commit message', [
        'ABC-1234',
        'DEF-5678',
      ]);
      expect(result).toBe('This is commit message');
    });
  });

  describe('prependIssueToHeader', () => {
    it('should add issue to header', () => {
      const result = prependIssueToHeader('This is commit message', 'ABC-1234');
      expect(result).toBe('ABC-1234 This is commit message');
    });
  });

  describe('appendIssueToFooter', () => {
    it('should add issue to footer', () => {
      const result = appendIssueToFooter('This is commit message', 'ABC-1234', []);
      expect(result).toBe('This is commit message\n\nABC-1234');
    });
    it('should add issue to footer with existing issues', () => {
      const result = appendIssueToFooter('This is commit message\n\nDEF-5678', 'ABC-1234', [
        'DEF-5678',
      ]);
      expect(result).toBe('This is commit message\n\nDEF-5678 ABC-1234');
    });
  });

  describe('moveIssueToHeader', () => {
    it('should move issue to header', () => {
      const result = moveIssueToHeader(
        'This is commit message\n\nABC-1234',
        'ABC-1234',
        [],
        ['ABC-1234'],
      );
      expect(result).toBe('ABC-1234 This is commit message');
    });
    it('should move issue to header with existing issue in header', () => {
      const result = moveIssueToHeader(
        'ABC-5678 This is commit message\n\nABC-1234',
        'ABC-1234',
        ['ABC-5678'],
        ['ABC-1234'],
      );
      expect(result).toBe('ABC-1234 This is commit message');
    });
    it('should move issue to header with existing issue in footer', () => {
      const result = moveIssueToHeader(
        'This is commit message\n\nABC-5678 ABC-1234',
        'ABC-1234',
        ['ABC-5678'],
        ['ABC-5678', 'ABC-1234'],
      );
      expect(result).toBe('ABC-1234 This is commit message\n\nABC-5678');
    });
    it('should move issue to header with existing issue in header and footer', () => {
      const result = moveIssueToHeader(
        'ABC-5678 This is commit message\n\nABC-1234 DEF-9012',
        'ABC-1234',
        ['ABC-5678'],
        ['ABC-1234', 'DEF-9012'],
      );
      expect(result).toBe('ABC-1234 This is commit message\n\nDEF-9012');
    });
  });

  describe('moveIssueToFooter', () => {
    it('should move issue to footer', () => {
      const result = moveIssueToFooter('ABC-1234 This is commit message', 'ABC-1234', []);
      expect(result).toBe('This is commit message\n\nABC-1234');
    });
    it('should move issue to footer with existing issue in footer', () => {
      const result = moveIssueToFooter('ABC-1234 This is commit message\n\nABC-5678', 'ABC-1234', [
        'ABC-5678',
      ]);
      expect(result).toBe('This is commit message\n\nABC-5678 ABC-1234');
    });
  });

  describe('addIssueToFooter', () => {
    it('should add issue to footer', () => {
      const result = addIssueToFooter('This is commit message', 'ABC-1234', [], []);
      expect(result).toBe('This is commit message\n\nABC-1234');
    });
    it('should replace issue in footer with existing issues', () => {
      const result = addIssueToFooter(
        'This is commit message\n\nDEF-5678',
        'ABC-1234',
        [],
        ['DEF-5678'],
      );
      expect(result).toBe('This is commit message\n\nABC-1234');
    });
    it('should clean the header when adding anything to the footer', () => {
      const result = addIssueToFooter(
        'ABC-5678 This is commit message\n\nDEF-5678',
        'ABC-1234',
        ['ABC-5678'],
        ['DEF-5678'],
      );
      expect(result).toBe('This is commit message\n\nABC-1234');
    });
    it('should add issue to footer with existing issues in footer', () => {
      const result = addIssueToFooter(
        'This is commit message\n\nDEF-5678 XYZ-9012',
        'ABC-1234',
        [],
        ['DEF-5678', 'XYZ-9012'],
      );
      expect(result).toBe('This is commit message\n\nDEF-5678 XYZ-9012 ABC-1234');
    });
  });
});
