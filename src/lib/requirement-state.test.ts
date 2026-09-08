import { expect, it } from 'vitest';
import { requirementState } from './requirement-state';
import type { LearningRun } from './test-results';
const run: LearningRun = { state: 'finished', startedAt: '', fingerprint: '', assertions: [{ title: '[basic-02-01] 編集', fullName: '編集', state: 'passed', messages: [] }] };
it('never treats missing, pending, skipped, stale or errored results as success', () => {
  expect(requirementState(undefined, 'basic-02-01')).toBe('未実行');
  expect(requirementState(run, 'basic-02-01')).toBe('成功');
  expect(requirementState(run, 'basic-02-02')).toBe('未検出');
  expect(requirementState({ ...run, stale: true }, 'basic-02-01')).toBe('再実行が必要');
  expect(requirementState({ ...run, state: 'error' }, 'basic-02-01')).toBe('実行エラー');
  expect(requirementState({ ...run, state: 'running' }, 'basic-02-01')).toBe('実行中');
  for (const [state, label] of [['todo', '未実装'], ['skipped', 'スキップ'], ['failed', '失敗']] as const) {
    expect(requirementState({ ...run, assertions: [...run.assertions, { ...run.assertions[0], state }] }, 'basic-02-01')).toBe(label);
  }
});
