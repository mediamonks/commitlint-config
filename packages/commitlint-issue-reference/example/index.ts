import { readFileSync, writeFileSync } from 'node:fs';
import processCommitMessage, { type LintOptions } from '../src/index.js';

// return absolute path to fixture file
function getFixturePath(fileName: string): string {
  // eslint-disable-next-line unicorn/prevent-abbreviations
  const fixtureDir = './fixtures';
  const fixturePath = `${fixtureDir}/${fileName}`;
  // make absolute
  return new URL(fixturePath, import.meta.url).pathname;
}

function runTest({
  fileName,
  ...options
}: { fileName: string } & Partial<Omit<LintOptions, 'file'>>): void {
  const filePath = getFixturePath(fileName);

  // save current file content, to restore after the test
  const fileContent = readFileSync(filePath, 'utf8');

  processCommitMessage({
    file: filePath,
    ...options,
  });

  writeFileSync(filePath, fileContent);
}

/**
 * Uncomment the examples below to test individual cases, and inspect the output in the terminal.
 * These can be run by executing `npm run dev`.
 */

// HEADER

// correct
runTest({
  fileName: 'header-correct.txt',
  branch: 'feature/ABC-123-test-feature',
});

// missing auto add
// runTest({
//   fileName: 'header-missing.txt',
//   branch: 'feature/ABC-123-test-feature',
// });

// missing no auto add
// runTest({
//   fileName: 'header-missing.txt',
//   branch: 'feature/ABC-123-test-feature',
//   autoAdd: false,
// });

// wrong issue
// runTest({
//   fileName: 'header-incorrect-issue.txt',
//   branch: 'feature/ABC-123-test-feature',
// });
// runTest({
//   fileName: 'header-incorrect-issue-and-position.txt',
//   branch: 'feature/ABC-123-test-feature',
// });
// runTest({
//   fileName: 'header-missing-footer-other.txt',
//   branch: 'feature/ABC-123-test-feature',
// });
// runTest({
//   fileName: 'header-missing-footer-others.txt',
//   branch: 'feature/ABC-123-test-feature',
// });

// wrong location
// runTest({
//   fileName: 'footer-correct.txt',
//   branch: 'feature/ABC-123-test-feature',
// });

// wrong position
// runTest({
//   fileName: 'header-incorrect-position.txt',
//   branch: 'feature/ABC-123-test-feature',
// });

// wrong format, separator
// runTest({
//   fileName: 'header-incorrect-separator.txt',
//   branch: 'feature/ABC-123-test-feature',
//   issueCommitPattern: '^(?<issue>ABC-\\d+)\\s',
//   issueBranchPattern: '(?:^|/)(?<issue>ABC-\\d+)-',
//   issuePrefix: '',
// });

// wrong amount with correct included
// runTest({
//   fileName: 'header-multiple.txt',
//   branch: 'feature/ABC-123-test-feature',
// });
// wrong amount with correct missing
// runTest({
//   fileName: 'header-multiple.txt',
//   branch: 'feature/XYZ-789-test-feature',
// });

// FOOTER

// correct
// runTest({
//   fileName: 'footer-correct.txt',
//   branch: 'feature/ABC-123-test-feature',
//   location: 'footer',
// });
// multiple
// runTest({
//   fileName: 'footer-multiple-correct.txt',
//   branch: 'feature/ABC-123-test-feature',
//   location: 'footer',
// });

// missing auto add
// runTest({
//   fileName: 'footer-missing.txt',
//   branch: 'feature/ABC-123-test-feature',
//   location: 'footer',
// });

// missing no auto add
// runTest({
//   fileName: 'footer-missing.txt',
//   branch: 'feature/ABC-123-test-feature',
//   location: 'footer',
//   autoAdd: false,
// });

// wrong issue
// runTest({
//   fileName: 'footer-incorrect-issue.txt',
//   branch: 'feature/ABC-123-test-feature',
//   location: 'footer',
// });
// runTest({
//   fileName: 'header-incorrect-issue.txt',
//   branch: 'feature/ABC-123-test-feature',
//   location: 'footer',
// });
// runTest({
//   fileName: 'footer-multiple-incorrect.txt',
//   branch: 'feature/ABC-123-test-feature',
//   location: 'footer',
// });
// runTest({
//   fileName: 'footer-multiple-incorrect-and-location.txt',
//   branch: 'feature/ABC-123-test-feature',
//   location: 'footer',
// });
// runTest({
//   fileName: 'footer-multiple-incorrect-and-location.txt',
//   branch: 'feature/DEF-456-test-feature',
//   location: 'footer',
// });

// wrong location
// runTest({
//   fileName: 'header-correct.txt',
//   branch: 'feature/ABC-123-test-feature',
//   location: 'footer',
// });

// EXTRA

// correct, github with prefix
// runTest({
//   fileName: 'header-correct-github.txt',
//   branch: 'feature/123-test-feature',
//   issuePrefix: '#',
// });

// correct, Jira without prefix, and same patterns
// runTest({
//   fileName: 'header-correct-github.txt',
//   branch: 'feature/123-test-feature',
//   issueCommitPattern: 'ABC-\\d+',
//   issueBranchPattern: 'ABC-\\d+',
// });

// correct, github without prefix, and different patterns
// runTest({
//   fileName: 'header-correct-github.txt',
//   branch: 'feature/123-test-feature',
//   issueCommitPattern: '#\\d+',
//   issueBranchPattern: '\\d+',
// });

// error, github without prefix, and complex patterns that can't resolve a prefix
// runTest({
//   fileName: 'header-correct-github.txt',
//   branch: 'feature/123-test-feature',
//   issueCommitPattern: '(#\\d+)',
//   issueBranchPattern: '(\\d+)',
// });

// correct github with prefix
// runTest({
//   fileName: 'footer-multiple-correct-github.txt',
//   branch: 'feature/123-test-feature',
//   location: 'footer',
//   issuePrefix: '#',
// });

// correct jira with patterns
// runTest({
//   fileName: 'footer-multiple-correct.txt',
//   branch: 'feature/ABC-123-test-feature',
//   location: 'footer',
//   issueCommitPattern: '[A-Z\\d]+-\\d+',
//   issueBranchPattern: '[A-Z\\d]+-\\d+',
// });

// correct github with auto-prefix
// runTest({
//   fileName: 'footer-multiple-correct-github.txt',
//   branch: 'feature/123-test-feature',
//   location: 'footer',
//   issueCommitPattern: '#\\d+',
//   issueBranchPattern: '\\d+',
// });
