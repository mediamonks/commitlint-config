import { readFileSync, writeFileSync } from 'node:fs';

export function saveCommitMessage(message: string, file: string): void {
  writeFileSync(file, message, 'utf8');
}

export function loadCommitMessage(file: string): string {
  return readFileSync(file, 'utf8').trim();
}
