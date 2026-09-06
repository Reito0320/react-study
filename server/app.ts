import express from 'express'
import type { ErrorRequestHandler } from 'express'
import { createExerciseRouter } from './exercises.ts'
import { createReferenceRouter, pipelineResult, ReferenceError } from './reference.ts'
import type { PipelineState } from './reference.ts'

export function createApp() {
  const app = express()
  app.disable('x-powered-by')
  app.use(express.json({ limit: '100kb' }))
  app.get('/api/health', (_, response) => {
    response.json({ ok: true })
  })
  app.use('/api/reference', createReferenceRouter())
  app.use('/api/tasks', createExerciseRouter())
  app.use((_, response) => {
    response.status(404).json({ error: 'NOT_FOUND', message: 'API が見つかりません。' })
  })
  const errorHandler: ErrorRequestHandler = (error: unknown, _, response, next) => {
    if (response.headersSent) {
      next(error)
      return
    }
    if (error instanceof ReferenceError) {
      const state = response.locals.pipeline as PipelineState | undefined
      state?.trace.push('error-handler')
      response.status(400).json({
        ok: false,
        error: 'DEMO_VALIDATION_ERROR',
        message: error.message,
        ...pipelineResult(response),
      })
      return
    }
    if (typeof error === 'object' && error !== null && 'type' in error) {
      if (error.type === 'entity.parse.failed') {
        response.status(400).json({ error: 'INVALID_JSON', message: 'JSON の構文を確認してください。' })
        return
      }
      if (error.type === 'entity.too.large') {
        response.status(413).json({ error: 'BODY_TOO_LARGE', message: 'JSON ボディは 100 KB 以下にしてください。' })
        return
      }
    }
    response.status(500).json({ error: 'INTERNAL_ERROR', message: 'サーバー内部でエラーが発生しました。' })
  }
  app.use(errorHandler)
  return app
}
