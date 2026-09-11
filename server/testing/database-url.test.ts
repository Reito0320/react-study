// @vitest-environment node
import { expect, it } from 'vitest'
import { testDatabaseUrl, testSchemaName } from './database-url.ts'

const learning = 'postgresql://learner:password@127.0.0.1:5433/hook_build'
it('keeps credentials and port but derives a distinct test database', () => {
  expect(testDatabaseUrl(learning)).toBe(`${learning}_test`)
  expect(testDatabaseUrl(`${learning}?schema=custom`)).toBe(`${learning}_test`)
})
it('rejects the learning database, remote hosts and connection overrides', () => {
  for (const url of [learning, `${learning}?schema=test`, `${learning.replace('127.0.0.1', 'example.com')}_test`, `${learning}_test?options=-csearch_path%3Dpublic`]) {
    expect(() => testDatabaseUrl(learning, url)).toThrow()
  }
  expect(() => testDatabaseUrl(undefined)).toThrow()
  expect(() => testDatabaseUrl(learning, `${learning.replace('hook_build', '%68ook_build')}`)).toThrow()
})
it('only allows cleanup of generated test schema names', () => {
  for (const name of ['public', 'learning_test_', 'learning_test_x', 'x"; DROP SCHEMA public']) {
    expect(() => testSchemaName(name)).toThrow()
  }
  expect(testSchemaName(`learning_test_${'a'.repeat(32)}`)).toMatch(/^learning_test_/)
})
