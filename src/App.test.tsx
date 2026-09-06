import { afterEach, beforeEach, expect, it, vi } from 'vitest'
import { render, screen } from '@testing-library/react'
import userEvent from '@testing-library/user-event'
import App from './App'
import { STORAGE_KEY } from './lib/progress'

beforeEach(() => localStorage.clear())
afterEach(() => vi.restoreAllMocks())
const stepNames = ['要件を読んだ', '実装した', 'UIで確認した', 'テストを追加・実行した']
it('enforces the sequence, persists progress, and invalidates later steps on cancellation', async () => {
  const user = userEvent.setup()
  render(<App />)
  expect(screen.getByRole('checkbox', { name: stepNames[1] })).toBeDisabled()
  expect(screen.getByRole('button', { name: /次の課題へ/ })).toBeDisabled()
  for (const name of stepNames) await user.click(screen.getByRole('checkbox', { name }))
  expect(screen.getByRole('button', { name: /次の課題へ/ })).toBeEnabled()
  expect(JSON.parse(localStorage.getItem(STORAGE_KEY)!)).toMatchObject({ 'basic-01': 4 })
  await user.click(screen.getByRole('checkbox', { name: stepNames[1] }))
  expect(screen.getByRole('checkbox', { name: stepNames[0] })).toBeChecked()
  for (const name of stepNames.slice(1)) expect(screen.getByRole('checkbox', { name })).not.toBeChecked()
  expect(screen.getByRole('checkbox', { name: stepNames[2] })).toBeDisabled()
  expect(screen.getByRole('button', { name: /次の課題へ/ })).toBeDisabled()
})
it('closes the reference on lesson navigation while retaining recorded progress', async () => {
  const user = userEvent.setup()
  const { container } = render(<App />)
  const reference = () => container.querySelector('details.reference')!
  expect(reference()).not.toHaveAttribute('open')
  await user.click(screen.getByText('参考書をひらく'))
  expect(reference()).toHaveAttribute('open')
  await user.click(screen.getByRole('checkbox', { name: stepNames[0] }))
  await user.click(screen.getByRole('button', { name: /編集と削除を実装/ }))
  expect(reference()).not.toHaveAttribute('open')
  expect(screen.getByRole('checkbox', { name: stepNames[0] })).not.toBeChecked()
  await user.click(screen.getByRole('button', { name: /タスクを追加して一覧に表示/ }))
  expect(screen.getByRole('checkbox', { name: stepNames[0] })).toBeChecked()
})
it('keeps demo state separate from task progress and restores progress after remount', async () => {
  const user = userEvent.setup()
  const view = render(<App />)
  await user.click(screen.getByText('参考書をひらく'))
  await user.click(screen.getByRole('button', { name: '＋1する' }))
  expect(screen.getByText('カウント: 1')).toBeVisible()
  expect(screen.getByRole('checkbox', { name: stepNames[0] })).not.toBeChecked()
  await user.click(screen.getByRole('checkbox', { name: stepNames[0] }))
  view.unmount()
  render(<App />)
  expect(screen.getByRole('checkbox', { name: stepNames[0] })).toBeChecked()
  await user.click(screen.getByText('参考書をひらく'))
  expect(screen.getByText('カウント: 0')).toBeVisible()
})
it('reports failed persistence but lets the learner continue in memory', async () => {
  vi.spyOn(Storage.prototype, 'setItem').mockImplementation(() => { throw new Error('quota') })
  const user = userEvent.setup()
  render(<App />)
  await user.click(screen.getByRole('checkbox', { name: stepNames[0] }))
  expect(screen.getByRole('alert')).toHaveTextContent('進捗を保存できません')
  await user.click(screen.getByRole('checkbox', { name: stepNames[1] }))
  expect(screen.getByRole('checkbox', { name: stepNames[1] })).toBeChecked()
})
