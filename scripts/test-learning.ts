import { spawn } from 'node:child_process';
import { mkdir, open, readFile, unlink } from 'node:fs/promises';
import { resolve } from 'node:path';
import { lessons } from '../src/data/curriculum.ts';
import { fingerprint, projectRoot, readResults, writeResults } from '../server/learning-results.ts';
import type { LearningAssertion } from '../src/lib/test-results.ts';
import type { JsonTestResults } from 'vitest/node';

const lessonId = process.argv[2];
if (process.argv.length > 3 || (lessonId && !lessons.some(l => l.id === lessonId))) {
  console.error('例: npm run test:learning -- basic-02（引数なしなら全課題）'); process.exit(2);
}
const ids = lessonId ? [lessonId] : lessons.map(l => l.id);
await mkdir(resolve(projectRoot, '.learning'), { recursive: true });
const lockPath = resolve(projectRoot, '.learning/run.lock');
let lock;
try { lock = await open(lockPath, 'wx'); }
catch { console.error('別の学習テストが実行中です。中断後なら実行プロセスがないことを確認して.learning/run.lockを削除してください。'); process.exit(2); }
const rawPath = resolve(projectRoot, `.learning/run-${process.pid}.json`);
try {
  const startedAt = new Date().toISOString();
  const hash = await fingerprint();
  let results;
  try { results = await readResults(); } catch { results = { version: 1 as const, runs: {} }; }
  for (const id of ids) results.runs[id] = { state: 'running', startedAt, fingerprint: hash, assertions: [] };
  await writeResults(results);
  const args = ['node_modules/vitest/vitest.mjs', 'run', 'src/exercises', 'server/exercises.test.ts', 'server/prisma.test.ts', 'server/task-persistence.test.ts', '--reporter=default', '--reporter=json', `--outputFile.json=${rawPath}`];
  if (lessonId) args.push('-t', `\\[${lessonId}\\]`);
  const code = await new Promise<number>(resolveCode => {
    const child = spawn(process.execPath, args, { cwd: projectRoot, stdio: 'inherit' });
    child.on('error', () => resolveCode(2));
    child.on('exit', code => resolveCode(code ?? 2));
  });
  try {
    const raw = JSON.parse(await readFile(rawPath, 'utf8')) as JsonTestResults;
    if (!Array.isArray(raw.testResults)) throw new Error('テスト結果が生成されませんでした');
    const hasFailedAssertions = raw.testResults.some(file => file.assertionResults?.some(a => a.status === 'failed'));
    for (const id of ids) {
      const assertions: LearningAssertion[] = raw.testResults.flatMap(file => file.assertionResults ?? []).filter(a => a.ancestorTitles.some(title => title.includes(`[${id}]`))).map(a => ({ title: a.title, fullName: a.fullName, state: a.status === 'passed' ? 'passed' : a.status === 'failed' ? 'failed' : a.status === 'todo' ? 'todo' : 'skipped', messages: a.failureMessages ?? [] }));
      const runError = raw.testResults.some(file => file.status === 'failed' && !file.assertionResults?.some(a => a.status === 'failed'));
      results.runs[id] = { state: runError || (code !== 0 && !hasFailedAssertions) ? 'error' : 'finished', startedAt, finishedAt: new Date().toISOString(), fingerprint: hash, assertions, ...(runError || (code !== 0 && !hasFailedAssertions) ? { error: 'テストの読込・実行でエラーが発生しました。ターミナルを確認してください。' } : {}) };
    }
  } catch (error) {
    for (const id of ids) results.runs[id] = { state: 'error', startedAt, finishedAt: new Date().toISOString(), fingerprint: hash, assertions: [], error: error instanceof Error ? error.message : '結果を読み取れませんでした' };
  }
  await writeResults(results);
  console.log('\n学習画面の「要件ごとのテスト結果」に反映しました。TODOは成功には含みません。');
  process.exitCode = code || (ids.some(id => results.runs[id].state === 'error') ? 2 : 0);
} finally { await lock.close(); await unlink(lockPath); await unlink(rawPath).catch(() => {}); }
