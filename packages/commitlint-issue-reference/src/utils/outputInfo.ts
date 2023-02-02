/* eslint-disable no-console */
import chalk from 'chalk';

export function outputFoundTicketInBranch(ticket: string): void {
  console.log(`
Found ticket in branch: ${chalk.blue(ticket)}
`);
}
export function outputNoTicketInBranch(): void {
  console.log(`No ticket found in branch name, skipping this check.
`);
}

export function getErrorBlock(): string {
  return chalk.bold.whiteBright.bgRed(` Error `);
}
export function getActualHeader(): string {
  return chalk.bold.whiteBright.bgRedBright(` Actual: `);
}

export function getExpectedHeader(): string {
  return chalk.bold.whiteBright.bgGreenBright(` Expected: `);
}

export function outputAuthAddTicket(ticket: string, updatedMessage: string): void {
  console.log(
    `No ticket found in commit message.
Adding ticket ${chalk.blue(ticket)} to commit message.

Updated commit message is:
${chalk.blue(updatedMessage)}
`,
  );
}

export function outputErrorInfo(missingTicket: string): void {
  console.log(`Commit again with the issue reference ${chalk.blue(
    missingTicket,
  )} included in the correct location.
If the commit does not relate to this issue, use the ${chalk.blue(
    `--no-verify`,
  )} flag to skip this check.
`);
}

export function outputError(
  errorMessage: string,
  message: string,
  expectedMessage: string | undefined,
  missingTicket: string,
): void {
  console.log(`${errorMessage}

${getActualHeader()}
${chalk.red(message)}
${
  expectedMessage
    ? `
${getExpectedHeader()}
${chalk.green(expectedMessage)}
`
    : ''
}
`);

  outputErrorInfo(missingTicket);
}
