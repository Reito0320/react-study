export interface TestRequirement { id: string; title: string }
export type AssertionState = 'passed' | 'failed' | 'todo' | 'skipped';
export interface LearningAssertion { title: string; fullName: string; state: AssertionState; messages: string[] }
export interface LearningRun {
  state: 'running' | 'finished' | 'error';
  startedAt: string;
  finishedAt?: string;
  fingerprint: string;
  assertions: LearningAssertion[];
  error?: string;
  stale?: boolean;
}
export interface LearningResults { version: 1; catalog?: Record<string, TestRequirement[]>; runs: Record<string, LearningRun> }
