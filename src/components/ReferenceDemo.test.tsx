import { act, fireEvent, render, screen } from '@testing-library/react'
import { afterEach, expect, it, vi } from 'vitest'
import ReferenceDemo from './ReferenceDemo'

afterEach(() => vi.useRealTimers())

it('cancels obsolete input updates and cleans up when the async demo unmounts', () => {
  vi.useFakeTimers()
  const view = render(<ReferenceDemo kind="async" />)
  const input = screen.getByRole('textbox', { name: '非同期デモの入力' })
  fireEvent.change(input, { target: { value: '古い入力' } })
  act(() => vi.advanceTimersByTime(500))
  fireEvent.change(input, { target: { value: '最新の入力' } })
  act(() => vi.advanceTimersByTime(200))
  expect(screen.getByRole('status')).toHaveTextContent('待機中…')
  expect(screen.queryByText('結果: 古い入力')).not.toBeInTheDocument()
  act(() => vi.advanceTimersByTime(500))
  expect(screen.getByRole('status')).toHaveTextContent('結果: 最新の入力')
  fireEvent.change(input, { target: { value: '解除する入力' } })
  view.unmount()
  expect(vi.getTimerCount()).toBe(0)
})
