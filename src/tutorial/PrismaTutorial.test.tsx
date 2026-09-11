import { expect, it, vi } from 'vitest'
import { render, screen } from '@testing-library/react'
import userEvent from '@testing-library/user-event'
import PrismaTutorial from './PrismaTutorial'

it('shows runnable instructions and query examples and continues to persistence', async () => {
  const onContinue = vi.fn()
  const user = userEvent.setup()
  render(<PrismaTutorial onContinue={onContinue} />)
  expect(screen.getByText('npm run db:tutorial')).toBeVisible()
  await user.click(screen.getByText('findUnique — IDで1件取得'))
  expect(screen.getByText(/idなど一意な項目で検索/)).toBeVisible()
  await user.click(screen.getByRole('button', { name: /基礎8：タスクAPIをDB保存へ/ }))
  expect(onContinue).toHaveBeenCalledOnce()
})
