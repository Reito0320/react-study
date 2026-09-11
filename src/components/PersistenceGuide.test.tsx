import { expect, it } from 'vitest'
import { render, screen } from '@testing-library/react'
import { NextAction } from './LearningGuide'
import { lessons } from '../data/curriculum'

it('places persistence after setup and shows the implementation and test locations', () => {
  const index = lessons.findIndex(lesson => lesson.id === 'basic-07')
  const lesson = lessons[index + 1]
  expect(lesson.id).toBe('basic-08')
  expect(lesson.optional).not.toBe(true)
  render(<NextAction lesson={lesson} current={0} />)
  expect(screen.getByRole('heading', { name: '今のタスクAPIをDB保存へ' })).toBeVisible()
  expect(screen.getByText('server/db/task-service.ts')).toBeVisible()
  expect(screen.getByText('npm run test:learning -- basic-08')).toBeInTheDocument()
})
