// @vitest-environment node
import { expect, it } from 'vitest';
import { parseTestCatalog, readTestCatalog } from './test-catalog.ts';
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

it('includes Prisma reference tests and learner TODOs in the live catalog', async () => {
  const catalog = await readTestCatalog()
  expect(catalog['basic-07']).toHaveLength(2)
  expect(catalog['intermediate-07'].map(entry => entry.id)).toEqual([
    'intermediate-07-01', 'intermediate-07-02', 'intermediate-07-03',
    'intermediate-07-04', 'intermediate-07-05',
  ])
})

it('registers the five persistence requirements for chapter eight', async () => {
  const catalog = await readTestCatalog()
  expect(catalog['basic-08'].map(entry => entry.id)).toEqual([
    'basic-08-01', 'basic-08-02', 'basic-08-03', 'basic-08-04', 'basic-08-05',
  ])
})
