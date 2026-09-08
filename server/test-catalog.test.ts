// @vitest-environment node
import { expect, it } from 'vitest';
import { parseTestCatalog } from './test-catalog.ts';
it('reads edited titles, added and removed tests without executing their bodies', () => {
  const source = `throw new Error('must not execute');
    describe('[basic-01] chapter', () => {
      it('[basic-01-01] renamed', () => { throw Error('no execution'); });
      describe('nested', () => { it.todo('[basic-01-02] added'); });
      it('extra', () => {});
    });`;
  expect(parseTestCatalog(source, 'sample.tsx')).toEqual({ 'basic-01': [
    { id: 'basic-01-01', title: 'renamed' }, { id: 'basic-01-02', title: 'added' },
  ] });
  expect(parseTestCatalog(source.replace("it.todo('[basic-01-02] added');", ''), 'sample.tsx')['basic-01']).toHaveLength(1);
});
it('rejects malformed source and duplicate IDs instead of publishing misleading rows', () => {
  expect(() => parseTestCatalog('describe(', 'bad.tsx')).toThrow();
  expect(() => parseTestCatalog("describe('[basic-01]',()=>{it.todo('[basic-01-01] a');it.todo('[basic-01-01] b')})", 'duplicate.tsx')).toThrow('重複');
});
