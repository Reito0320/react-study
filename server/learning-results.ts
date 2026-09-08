import { readTestCatalog } from './test-catalog.ts';
import { createHash } from 'node:crypto';
import { readFile, readdir, mkdir, rename, writeFile } from 'node:fs/promises';
import { resolve, join, relative } from 'node:path';
import { fileURLToPath } from 'node:url';
import type { LearningResults } from '../src/lib/test-results.ts';
export const projectRoot = fileURLToPath(new URL('../', import.meta.url));
export const resultsPath = resolve(projectRoot, '.learning/results.json');
export async function fingerprint(root = projectRoot): Promise<string> {
  const files: string[] = [];
  async function walk(path: string): Promise<void> {
    for (const entry of await readdir(path, { withFileTypes: true })) {
      if (entry.isSymbolicLink() || join(path, entry.name) === join(root, 'server/data')) continue;
      const child = join(path, entry.name);
      if (entry.isDirectory()) await walk(child);
      else if (/\.(tsx?|css|json)$/.test(entry.name)) files.push(child);
    }
  }
  await walk(join(root, 'src')); await walk(join(root, 'server'));
  for (const name of ['package.json', 'package-lock.json', 'vitest.config.ts', 'vite.config.ts']) files.push(join(root, name));
  const hash = createHash('sha256');
  for (const file of files.sort()) { hash.update(relative(root, file)); hash.update(await readFile(file)); }
  return hash.digest('hex');
}
export async function readResults(path = resultsPath): Promise<LearningResults> {
  try {
    const value = JSON.parse(await readFile(path, 'utf8')) as LearningResults;
    if (value.version !== 1 || !value.runs || typeof value.runs !== 'object' || Array.isArray(value.runs)) throw new Error('Invalid results');
    for (const run of Object.values(value.runs)) {
      if (!run || !['running','finished','error'].includes(run.state) || typeof run.fingerprint !== 'string' || typeof run.startedAt !== 'string' || !Array.isArray(run.assertions)) throw new Error('Invalid run');
      for (const a of run.assertions) if (!a || typeof a.title !== 'string' || typeof a.fullName !== 'string' || !['passed','failed','todo','skipped'].includes(a.state) || !Array.isArray(a.messages) || !a.messages.every(m => typeof m === 'string')) throw new Error('Invalid assertion');
    }
    return value;
  } catch (error) {
    if ((error as NodeJS.ErrnoException).code === 'ENOENT') return { version: 1, runs: {} };
    throw error;
  }
}
export async function writeResults(value: LearningResults): Promise<void> {
  await mkdir(resolve(projectRoot, '.learning'), { recursive: true });
  const temporary = `${resultsPath}.${process.pid}.tmp`;
  await writeFile(temporary, JSON.stringify(value, null, 2));
  await rename(temporary, resultsPath);
}
export async function currentResults(): Promise<LearningResults> {
  const result = await readResults();
  const current = await fingerprint();
  return { version: 1, catalog: await readTestCatalog(), runs: Object.fromEntries(Object.entries(result.runs).map(([id, run]) => [id, { ...run, stale: run.fingerprint !== current }])) };
}
