import type { LearningRun } from './test-results';

export function requirementState(run: LearningRun | undefined, id: string): string {
  if (!run) return '未実行';
  if (run.stale) return '再実行が必要';
  if (run.state === 'running') return '実行中';
  if (run.state === 'error') return '実行エラー';
  const matches = run.assertions.filter(a => a.title.includes(`[${id}]`));
  if (!matches.length) return '未検出';
  if (matches.some(a => a.state === 'failed')) return '失敗';
  if (matches.some(a => a.state === 'todo')) return '未実装';
  if (matches.some(a => a.state === 'skipped')) return 'スキップ';
  return '成功';
}
