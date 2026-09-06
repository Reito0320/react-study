import { randomUUID } from 'node:crypto'
import { performance } from 'node:perf_hooks'
import { Router } from 'express'
import type { Response } from 'express'

export interface PipelineState {
  requestId: string
  startedAt: number
  trace: string[]
}

export class ReferenceError extends Error {}

export function pipelineResult(response: Response) {
  const state = response.locals.pipeline as PipelineState | undefined
  if (!state) return {}
  return {
    requestId: state.requestId,
    elapsedMs: Math.max(0, Number((performance.now() - state.startedAt).toFixed(3))),
    trace: state.trace,
  }
}

// 完成済みの観測デモ。タスク管理 API の実装とは独立しています。
export function createReferenceRouter() {
  const router = Router()
  router.use((_, response, next) => {
    const state: PipelineState = {
      requestId: randomUUID(),
      startedAt: performance.now(),
      trace: ['request-id'],
    }
    response.locals.pipeline = state
    response.setHeader('X-Request-Id', state.requestId)
    next()
  })
  router.use((_, response, next) => {
    const state = response.locals.pipeline as PipelineState
    state.startedAt = performance.now()
    state.trace.push('timer')
    next()
  })
  router.get('/pipeline', (request, response, next) => {
    const state = response.locals.pipeline as PipelineState
    state.trace.push('validation')
    if (request.query.fail === '1') {
      next(new ReferenceError('デモ用の入力エラーです。'))
      return
    }
    state.trace.push('handler')
    response.json({ ok: true, ...pipelineResult(response) })
  })
  return router
}
