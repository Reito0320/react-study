import { afterEach, beforeEach, describe, expect, it, vi } from 'vitest'
import { advanceStep, readProgress, STORAGE_KEY } from './progress'

beforeEach(() => localStorage.clear())
afterEach(() => vi.restoreAllMocks())
describe('progress recovery', () => {
  it.each(['null', '[]', 'false', 'broken JSON', '42'])('ignores invalid saved state: %s', value => {
    localStorage.setItem(STORAGE_KEY, value)
    expect(readProgress()).toEqual({})
  })
  it('retains only integer steps in the supported range', () => {
    localStorage.setItem(STORAGE_KEY, JSON.stringify({ first: 0, done: 4, negative: -1, overflow: 5, partial: 1.5, text: '2', missing: null }))
    expect(readProgress()).toEqual({ first: 0, done: 4 })
  })
  it('continues when browser storage is unavailable', () => {
    vi.spyOn(Storage.prototype, 'getItem').mockImplementation(() => { throw new Error('unavailable') })
    expect(readProgress()).toEqual({})
  })
})
describe('learning sequence', () => {
  it('rejects jumping ahead and completes the four steps in order', () => {
    expect(advanceStep(0, 3)).toBe(0)
    let current = 0
    for (let step = 0; step < 4; step++) current = advanceStep(current, step)
    expect(current).toBe(4)
  })
  it('cancels the selected completed step and all following steps', () => {
    expect(advanceStep(4, 1)).toBe(1)
    expect(advanceStep(3, 0)).toBe(0)
  })
})
