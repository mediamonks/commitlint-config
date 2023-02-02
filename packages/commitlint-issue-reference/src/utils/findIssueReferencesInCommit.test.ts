import { findIssueReferencesInCommit } from './findIssueReferencesInCommit.js';

// add tests
describe('findIssueReferencesInCommit', () => {
  describe('when locating issues in commit header', () => {
    it('should find 0 issues', () => {
      const result = findIssueReferencesInCommit(
        'This is commit message',
        'ABC-1234',
        '[A-Z\\d]+-\\d+',
        'header',
      );
      expect(result).toMatchObject({
        isFound: false,
        hasCorrectAmount: true,
        hasCorrectFormat: true,
        hasCorrectPosition: true,
        hasCorrectLocation: true,
      });
    });

    it('should find 1 issue', () => {
      const result = findIssueReferencesInCommit(
        'ABC-1234 This is commit message',
        'ABC-1234',
        '[A-Z\\d]+-\\d+',
        'header',
      );
      expect(result).toMatchObject({
        isFound: true,
        hasCorrectAmount: true,
        hasCorrectFormat: true,
        hasCorrectPosition: true,
        hasCorrectLocation: true,
      });
    });

    it('should find 2 issues', () => {
      const result = findIssueReferencesInCommit(
        'ABC-1234 ABC-5678 This is commit message',
        'ABC-1234',
        '[A-Z\\d]+-\\d+',
        'header',
      );
      expect(result).toMatchObject({
        isFound: true,
        hasCorrectAmount: false,
        hasCorrectFormat: true,
        hasCorrectPosition: true,
        hasCorrectLocation: true,
      });
    });

    it('should detect the incorrect issue is referenced', () => {
      const result = findIssueReferencesInCommit(
        'DEF-456 This is commit message',
        'ABC-1234',
        '[A-Z\\d]+-\\d+',
        'header',
      );
      expect(result).toMatchObject({
        isFound: false,
        hasCorrectAmount: true,
        hasCorrectFormat: true,
        hasCorrectPosition: true,
        hasCorrectLocation: true,
        otherIssuesFound: true,
        foundMatches: ['DEF-456'],
      });
    });

    it('should detect the incorrect issue is referenced in the wrong location', () => {
      const result = findIssueReferencesInCommit(
        'This is commit message\n\nDEF-456',
        'ABC-1234',
        '[A-Z\\d]+-\\d+',
        'header',
      );
      expect(result).toMatchObject({
        isFound: false,
        hasCorrectAmount: true,
        hasCorrectFormat: true,
        hasCorrectPosition: true,
        hasCorrectLocation: false,
        otherIssuesFound: true,
      });
    });

    it('should detect that the issue is in the incorrect position', () => {
      const result = findIssueReferencesInCommit(
        `This is commit message ABC-1234`,
        'ABC-1234',
        '[A-Z\\d]+-\\d+',
        'header',
      );
      expect(result).toMatchObject({
        isFound: true,
        hasCorrectAmount: true,
        hasCorrectFormat: true,
        hasCorrectPosition: false,
        hasCorrectLocation: true,
      });
    });

    it('should detect that the issue is in the incorrect location', () => {
      const result = findIssueReferencesInCommit(
        `This is commit message\n\nABC-1234`,
        'ABC-1234',
        '[A-Z\\d]+-\\d+',
        'header',
      );
      expect(result).toMatchObject({
        isFound: true,
        hasCorrectAmount: true,
        hasCorrectFormat: true,
        hasCorrectPosition: true,
        hasCorrectLocation: false,
      });
    });
  });

  describe('when locating issues in commit footer', () => {
    it('should find 0 issues', () => {
      const result = findIssueReferencesInCommit(
        'This is commit message',
        'ABC-1234',
        '[A-Z\\d]+-\\d+',
        'footer',
      );
      expect(result).toMatchObject({
        isFound: false,
        hasCorrectAmount: false,
        hasCorrectFormat: true,
        hasCorrectPosition: undefined,
        hasCorrectLocation: true,
      });
    });
    it('should find 1 issue', () => {
      const result = findIssueReferencesInCommit(
        `This is commit message\n\nABC-1234`,
        'ABC-1234',
        '[A-Z\\d]+-\\d+',
        'footer',
      );
      expect(result).toMatchObject({
        isFound: true,
        hasCorrectAmount: true,
        hasCorrectFormat: true,
        hasCorrectPosition: undefined,
        hasCorrectLocation: true,
      });
    });
    it('should find 2 issues', () => {
      const result = findIssueReferencesInCommit(
        `This is commit message\n\nABC-1234 ABC-5678`,
        'ABC-1234',
        '[A-Z\\d]+-\\d+',
        'footer',
      );
      expect(result).toMatchObject({
        isFound: true,
        hasCorrectAmount: true,
        hasCorrectFormat: true,
        hasCorrectPosition: undefined,
        hasCorrectLocation: true,
      });
    });

    it('should detect the incorrect issue is referenced', () => {
      const result = findIssueReferencesInCommit(
        'This is commit message\n\nDEF-456',
        'ABC-1234',
        '[A-Z\\d]+-\\d+',
        'footer',
      );
      expect(result).toMatchObject({
        isFound: false,
        hasCorrectAmount: true,
        hasCorrectFormat: true,
        hasCorrectPosition: undefined,
        hasCorrectLocation: true,
        otherIssuesFound: true,
      });
    });

    it('should detect the incorrect issue is referenced in the body', () => {
      const result = findIssueReferencesInCommit(
        'DEF-456 This is commit message',
        'ABC-1234',
        '[A-Z\\d]+-\\d+',
        'footer',
      );
      expect(result).toMatchObject({
        isFound: false,
        hasCorrectAmount: false,
        hasCorrectFormat: true,
        hasCorrectPosition: undefined,
        hasCorrectLocation: false,
        otherIssuesFound: true,
      });
    });

    it('should detect that the issue is in the incorrect location', () => {
      const result = findIssueReferencesInCommit(
        `ABC-1234 This is commit message`,
        'ABC-1234',
        '[A-Z\\d]+-\\d+',
        'footer',
      );
      expect(result).toMatchObject({
        isFound: true,
        hasCorrectAmount: false,
        hasCorrectFormat: true,
        hasCorrectPosition: undefined,
        hasCorrectLocation: false,
      });
    });

    it('should detect that the issue is in the incorrect location, while there are other issues in the footer', () => {
      const result = findIssueReferencesInCommit(
        `ABC-1234 This is commit message\n\nDEF-456`,
        'ABC-1234',
        '[A-Z\\d]+-\\d+',
        'footer',
      );
      expect(result).toMatchObject({
        isFound: true,
        hasCorrectAmount: true,
        hasCorrectFormat: true,
        hasCorrectPosition: undefined,
        hasCorrectLocation: false,
        otherIssuesFound: true,
      });
    });
  });
  describe('when working with GitHub issues', () => {
    it('should find 1 issue in commit header', () => {
      const result = findIssueReferencesInCommit(
        '#1234 This is commit message',
        '#1234',
        '#\\d+',
        'header',
      );
      expect(result).toMatchObject({
        isFound: true,
        foundMatches: ['#1234'],
        hasCorrectAmount: true,
        hasCorrectFormat: true,
        hasCorrectPosition: true,
        hasCorrectLocation: true,
      });
    });
    it('should find two issues in commit body', () => {
      const result = findIssueReferencesInCommit(
        `This is commit message\n\n#1234, fixed #567`,
        '#1234',
        '#\\d+',
        'footer',
      );
      expect(result).toMatchObject({
        isFound: true,
        foundMatches: ['#1234', '#567'],
        hasCorrectAmount: true,
        hasCorrectFormat: true,
        hasCorrectPosition: undefined,
        hasCorrectLocation: true,
      });
    });

    describe('when requiring custom patterns', () => {
      it('should find issue with a group in custom pattern', () => {
        const result = findIssueReferencesInCommit(
          '#123:This is commit message',
          '#123',
          '(#\\d+):',
          'header',
        );
        expect(result).toMatchObject({
          isFound: true,
          foundMatches: ['#123'],
          hasCorrectAmount: true,
          hasCorrectFormat: true,
          hasCorrectPosition: true,
          hasCorrectLocation: true,
        });
      });

      it('should find issue with a named group in custom pattern', () => {
        const result = findIssueReferencesInCommit(
          '#123:This is commit message',
          '#123',
          '(?<issue>#\\d+):',
          'header',
        );
        expect(result).toMatchObject({
          isFound: true,
          foundMatches: ['#123'],
          hasCorrectAmount: true,
          hasCorrectFormat: true,
          hasCorrectPosition: true,
          hasCorrectLocation: true,
        });
      });

      it('should find issue in commit header, but with incorrect pattern', () => {
        const result = findIssueReferencesInCommit(
          '#123:This is commit message',
          '#123',
          '^(?<issue>#\\d+) ',
          'header',
        );
        expect(result).toMatchObject({
          isFound: true,
          foundMatches: [],
          headerMatchResults: { branchIssueMatches: ['#123'] },
          hasCorrectAmount: true,
          hasCorrectFormat: false,
          hasCorrectPosition: true,
          hasCorrectLocation: true,
        });
      });
    });
  });
});
