import { afterEach, expect, it, vi } from 'vitest'
import { render, screen } from '@testing-library/react'
import userEvent from '@testing-library/user-event'
import ApiTasks from './ApiTasks'

afterEach(() => { vi.unstubAllGlobals() })
it('初回取得中を表示し、成功した一覧を表示する', async () => {
  let resolve!: (response: unknown) => void
  vi.stubGlobal('fetch', vi.fn(() => new Promise(done => { resolve = done })))
  render(<ApiTasks />)
  expect(screen.getByRole('status')).toHaveTextContent('通信中')
  expect(screen.getByRole('button', { name: '再取得' })).toBeDisabled()
  resolve({ ok: true, status: 200, json: async () => [{ id: '1', title: 'APIを学ぶ', completed: false }] })
  expect(await screen.findByRole('checkbox', { name: 'APIを学ぶ' })).toBeVisible()
  expect(screen.getByRole('status')).toHaveTextContent('取得しました')
})
it('API停止時も通信中を終了し、再取得で復旧する', async () => {
  const fetchMock = vi.fn().mockRejectedValueOnce(new TypeError('Failed to fetch'))
    .mockResolvedValue({ ok: true, status: 200, json: async () => [] })
  vi.stubGlobal('fetch', fetchMock)
  const user = userEvent.setup()
  render(<ApiTasks />)
  expect(await screen.findByRole('alert')).toHaveTextContent('取得できません')
  expect(screen.getByRole('button', { name: '再取得' })).toBeEnabled()
  await user.click(screen.getByRole('button', { name: '再取得' }))
  expect(await screen.findByText('再取得しました。')).toBeVisible()
  expect(screen.queryByRole('alert')).not.toBeInTheDocument()
})
it('404応答を失敗として表示する', async () => {
  vi.stubGlobal('fetch', vi.fn()
    .mockResolvedValueOnce({ ok: true, status: 200, json: async () => [] })
    .mockResolvedValueOnce({ ok: false, status: 404 }))
  const user = userEvent.setup()
  render(<ApiTasks />)
  await screen.findByText('取得しました。')
  await user.click(screen.getByRole('button', { name: '404エラーを試す' }))
  expect(await screen.findByRole('alert')).toHaveTextContent('HTTP 404')
  expect(screen.getByRole('button', { name: '再取得' })).toBeEnabled()
})
