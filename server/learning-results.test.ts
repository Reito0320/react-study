// @vitest-environment node
import { mkdtemp, mkdir, writeFile, rm } from 'node:fs/promises';
import { tmpdir } from 'node:os';
import { join } from 'node:path';
import { expect, it } from 'vitest';
import { fingerprint, readResults } from './learning-results.js';
it('invalidates results after source edits but ignores API runtime data', async () => {
  const root = await mkdtemp(join(tmpdir(), 'learning-fingerprint-'));
  try {
    for (const path of ['src/data', 'server/data', 'prisma']) await mkdir(join(root, path), { recursive: true });
    for (const path of ['package.json', 'package-lock.json', 'vitest.config.ts', 'vite.config.ts', 'prisma.config.ts', 'prisma/schema.prisma', 'src/data/requirements.ts']) await writeFile(join(root, path), 'initial');
    const initial = await fingerprint(root);
    await writeFile(join(root, 'server/data/tasks.json'), 'runtime');
    expect(await fingerprint(root)).toBe(initial);
    await writeFile(join(root, 'src/data/requirements.ts'), 'changed');
    expect(await fingerprint(root)).not.toBe(initial);
    const beforeSchema = await fingerprint(root);
    await writeFile(join(root, 'prisma/schema.prisma'), 'changed schema');
    expect(await fingerprint(root)).not.toBe(beforeSchema);
    const resultPath = join(root, 'results.json');
    expect(await readResults(resultPath)).toEqual({ version: 1, runs: {} });
    await writeFile(resultPath, '{broken');
    await expect(readResults(resultPath)).rejects.toThrow();
    await writeFile(resultPath, JSON.stringify({ version: 1, runs: { 'basic-01': { state: 'finished', startedAt: '', fingerprint: '', assertions: [{ state: 'invented' }] } } }));
    await expect(readResults(resultPath)).rejects.toThrow();
  } finally { await rm(root, { recursive: true, force: true }); }
});
