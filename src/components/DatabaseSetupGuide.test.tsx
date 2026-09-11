import { expect, it } from 'vitest'
import { render, screen } from '@testing-library/react'
import userEvent from '@testing-library/user-event'
import { NextAction } from './LearningGuide'
import { lessons } from '../data/curriculum'

it('lets a solo learner open setup instructions without an existing database', async () => {
  const user = userEvent.setup()
  render(<NextAction lesson={lessons.find(lesson => lesson.id === 'basic-07')!} current={0} />)
  await user.click(screen.getByText('PostgreSQLをまだ用意していない'))
  expect(screen.getByRole('link', { name: 'PostgreSQL公式のOS別手順' })).toBeVisible()
  expect(screen.getByText(/docker run --name hook-build-postgres/)).toBeVisible()
  await user.click(screen.getByText('接続できないとき'))
  expect(screen.getByText(/接続拒否：DBの起動状態/)).toBeVisible()
})
