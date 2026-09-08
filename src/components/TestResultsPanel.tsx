import { requirementState } from '../lib/requirement-state';
import { useEffect, useState } from 'react';
import type { LearningAssertion, LearningResults } from '../lib/test-results';


function Messages({ assertions }: { assertions: LearningAssertion[] }) {
  const messages = assertions.flatMap(a => a.messages);
  return messages.length > 0 && <details><summary>失敗の詳細</summary><pre>{messages.join('\n')}</pre></details>;
}
export default function TestResultsPanel({ lessonId }: { lessonId: string }) {
  const [results, setResults] = useState<LearningResults>({ version: 1, runs: {} });
  const [error, setError] = useState('');
  const [copyNotice, setCopyNotice] = useState({ lessonId: '', message: '' });
  const copied = copyNotice.lessonId === lessonId && copyNotice.message === 'コピーしました';
  useEffect(() => {
    if (!copied) return;
    const timer = setTimeout(() => setCopyNotice({ lessonId: '', message: '' }), 2000);
    return () => clearTimeout(timer);
  }, [copied, copyNotice]);
  const command = `npm run test:learning -- ${lessonId}`;
  async function copyCommand() {
    try {
      await navigator.clipboard.writeText(command);
      setCopyNotice({ lessonId, message: 'コピーしました' });
    } catch {
      setCopyNotice({ lessonId, message: 'コピーできませんでした。下のコマンドを選択してコピーしてください。' });
    }
  }
  useEffect(() => {
    const controller = new AbortController();
    let busy = false;
    async function load() {
      if (busy) return;
      busy = true;
      try {
        const response = await fetch('/api/learning/test-results', { signal: controller.signal });
        if (!response.ok) {
          const failure = await response.json().catch(() => ({})) as { message?: string };
          throw new Error(failure.message ?? '結果を取得できません。npm run devでAPIを起動してください。');
        }
        const data = await response.json() as LearningResults;
        if (data.version !== 1 || !data.runs) throw new Error('結果の形式が不正です。test:learningを再実行してください。');
        if (!controller.signal.aborted) { setResults(data); setError(''); }
      } catch (error) {
        if (!controller.signal.aborted) setError(error instanceof Error ? error.message : '結果を取得できません');
      } finally { busy = false; }
    }
    void load();
    const timer = setInterval(() => void load(), 3000);
    return () => { controller.abort(); clearInterval(timer); };
  }, []);
  const run = error ? undefined : results.runs[lessonId];
  const requirements = results.catalog?.[lessonId] ?? [];
  const extras = run?.assertions.filter(a => !requirements.some(r => a.title.includes(`[${r.id}]`))) ?? [];
  return <article className="test-results-panel" aria-labelledby="test-results-heading">
    <div className="results-heading"><h2 id="test-results-heading">要件ごとのテスト結果</h2><button type="button" className={`copy-command${copied ? ' is-copied' : ''}`} onClick={() => void copyCommand()} aria-label={copied ? 'コピーしました' : 'テスト実行コマンドをコピー'} title={copied ? 'コピー済み' : 'テスト実行コマンドをコピー'}><svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.7" strokeLinecap="round" strokeLinejoin="round" aria-hidden="true">{copied ? <path d="m5 12 4 4L19 6" /> : <><rect x="9" y="9" width="11" height="12" rx="2" /><path d="M15 5V4a2 2 0 0 0-2-2H5a2 2 0 0 0-2 2v11a2 2 0 0 0 2 2h1" /></>}</svg></button></div>
    <pre><code>{command}</code></pre>
    <p role="status" className="copy-notice">{copyNotice.lessonId === lessonId && !copied ? copyNotice.message : ''}</p>
    {error && <p role="alert">{error}</p>}
    {run?.finishedAt && <p className="muted">実行日時：{new Date(run.finishedAt).toLocaleString('ja-JP')}</p>}
    {run?.stale && <p className="result-warning">実行後にコードが変更されています。再実行して現在の結果を確認してください。</p>}
    {run?.error && <p role="alert">{run.error}</p>}
    {!error && requirements.length === 0 && <p className="muted">{results.catalog ? 'この章にID付きテストはありません。' : 'テスト項目を読み込み中…'}</p>}
    <ul className="requirement-results">{requirements.map(requirement => {
      const state = requirementState(run, requirement.id);
      return <li key={requirement.id} data-result={state}><div><span className="result-status">{state === '成功' ? '✓ ' : state === '失敗' ? '✕ ' : '○ '}{state}</span><code>{requirement.id}</code></div><p>{requirement.title}</p><Messages assertions={run?.assertions.filter(a => a.title.includes(`[${requirement.id}]`)) ?? []} /></li>;
    })}</ul>
    {extras.length > 0 && <details><summary>追加で書いたテスト（{extras.length}件）</summary><ul>{extras.map((a, i) => <li key={`${a.fullName}-${i}`}>{run?.stale ? '再実行が必要' : run?.state !== 'finished' ? '実行結果を確認' : a.state === 'passed' ? '✓ 成功' : a.state === 'failed' ? '✕ 失敗' : a.state === 'todo' ? '未実装' : 'スキップ'}：{a.title}</li>)}</ul></details>}
    <details className="result-help"><summary>結果の見方</summary><p>コマンド実行後に自動更新します。it.todoは未実装です。成功は書かれた検証が通ったことを示します。学習チェックは自分で記録します。</p></details>
  </article>;
}
