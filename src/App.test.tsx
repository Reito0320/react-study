import { afterEach, beforeEach, expect, it, vi } from 'vitest'
import { fireEvent, render, screen, waitFor } from '@testing-library/react'
import userEvent from '@testing-library/user-event'
import App from './App'
import { STORAGE_KEY } from './lib/progress'

function renderLesson() {
  const view = render(<App />)
  fireEvent.click(screen.getByRole('button', { name: /チャプター1：タスク追加へ進む/ }))
  return view
}

beforeEach(() => {
  localStorage.clear()
  vi.stubGlobal('fetch', vi.fn().mockResolvedValue({ ok: true, json: async () => ({ version: 1, runs: {} }) }))
})
afterEach(() => { vi.restoreAllMocks(); vi.unstubAllGlobals() })
const stepNames = ['要件を読んだ', '実装した', 'UIで確認した', 'テストを追加・実行した']
it('enforces the sequence, persists progress, and invalidates later steps on cancellation', async () => {
  const user = userEvent.setup()
  renderLesson()
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
it('reports failed persistence but lets the learner continue in memory', async () => {
  vi.spyOn(Storage.prototype, 'setItem').mockImplementation(() => { throw new Error('quota') })
  const user = userEvent.setup()
  renderLesson()
  await user.click(screen.getByRole('checkbox', { name: stepNames[0] }))
  expect(screen.getByRole('alert')).toHaveTextContent('進捗を保存できません')
  await user.click(screen.getByRole('checkbox', { name: stepNames[1] }))
  expect(screen.getByRole('checkbox', { name: stepNames[1] })).toBeChecked()
})
it('updates the next action without a chapter one walkthrough', async () => {
  const user = userEvent.setup()
  const { container } = renderLesson()
  const guide = container.querySelector('details.walkthrough-guide')!
  expect(guide).toBeNull()
  await waitFor(() => expect(screen.getByRole('heading', { name: '次にすること：要件を具体例にする' })).toBeVisible())
  expect(screen.getByRole('checkbox', { name: stepNames[0] })).not.toBeChecked()
  await user.click(screen.getByRole('checkbox', { name: stepNames[0] }))
  expect(screen.getByRole('heading', { name: '次にすること：エディタで実装する' })).toBeVisible()
  await user.click(screen.getByRole('checkbox', { name: stepNames[1] }))
  expect(screen.getByRole('heading', { name: '次にすること：プレビューで操作する' })).toBeVisible()
  await user.click(screen.getByRole('checkbox', { name: stepNames[2] }))
  expect(screen.getByRole('heading', { name: '次にすること：テストを書いて実行する' })).toBeVisible()
  await user.click(screen.getByRole('checkbox', { name: stepNames[1] }))
  expect(screen.getByRole('heading', { name: '次にすること：エディタで実装する' })).toBeVisible()
})

it('starts at chapter zero and keeps lesson progress when returning to the introduction', async () => {
  const user = userEvent.setup()
  render(<App />)
  expect(screen.getByRole('heading', { name: 'カウンターで、学び方をひと回り。' })).toBeVisible()
  await user.click(screen.getByRole('button', { name: '＋1' }))
  await user.click(screen.getByRole('button', { name: /チャプター1：タスク追加へ進む/ }))
  await user.click(screen.getByRole('checkbox', { name: stepNames[0] }))
  await user.click(screen.getByRole('button', { name: /00 はじめに：カウンターで実演/ }))
  expect(screen.getByRole('status', { name: 'カウント' })).toHaveTextContent(/^0$/)
  await user.click(screen.getByRole('button', { name: /チャプター1：タスク追加へ進む/ }))
  expect(screen.getByRole('checkbox', { name: stepNames[0] })).toBeChecked()
})

it('persists sidebar collapse and allows reopening', async () => {
  const user = userEvent.setup()
  const view = renderLesson()
  await user.click(screen.getByRole('button', { name: /メニューを閉じる/ }))
  await waitFor(() => expect(view.container.querySelector('#curriculum-sidebar')).not.toBeVisible())
  view.unmount()
  const next = render(<App />)
  expect(next.container.querySelector('#curriculum-sidebar')).not.toBeVisible()
  await user.click(screen.getByRole('button', { name: /メニューを開く/ }))
  await waitFor(() => expect(next.container.querySelector('#curriculum-sidebar')).toBeVisible())
})

it('resumes the selected chapter after remount and falls back for an unknown chapter', async () => {
  const user = userEvent.setup()
  const view = renderLesson()
  await user.click(screen.getByRole('button', { name: /編集と削除を実装/ }))
  view.unmount()
  const resumed = render(<App />)
  await waitFor(() => expect(screen.getByRole('heading', { name: '編集と削除を実装' })).toBeVisible())
  resumed.unmount()
  localStorage.setItem('hook-lab-selected-chapter', 'removed-99')
  render(<App />)
  expect(screen.getByRole('heading', { name: 'カウンターで、学び方をひと回り。' })).toBeVisible()
})


it('opens the Prisma chapters and preserves existing progress', async () => {
  localStorage.setItem(STORAGE_KEY, JSON.stringify({ 'basic-02': 4 }))
  const user = userEvent.setup()
  render(<App />)
  await user.click(screen.getByRole('button', { name: /PostgreSQLとPrismaをローカルで起動/ }))
  await waitFor(() => expect(screen.getByRole('heading', { name: 'PostgreSQL・Prisma学習ガイド' })).toBeVisible())
  expect(screen.getByText('npm run db:apply')).toBeVisible()
  await user.click(screen.getByRole('button', { name: /Prismaのモックテストを書く/ }))
  await waitFor(() => expect(screen.getByRole('heading', { name: 'Prismaのモックテストを書く' })).toBeVisible())
  expect(screen.getByRole('button', { name: /編集と削除を実装/ })).toHaveTextContent('完了')
})
