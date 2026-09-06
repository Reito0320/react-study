import { Router } from 'express'
import type { RequestHandler } from 'express'

// TODO: 課題の要件に従って各ハンドラーを実装し、UI で確認した後にテストを追加します。
// 初期状態ではデータを保存しません。完成済みデモは reference.ts にあります。
export function createExerciseRouter() {
  const router = Router()
  const notImplemented: RequestHandler = (request, response) => {
    response.status(501).json({
      error: 'NOT_IMPLEMENTED',
      message: 'このタスク API は学習課題です。server/exercises.ts に実装してください。',
      method: request.method,
    })
  }
  router.get('/', notImplemented)
  router.get('/:id', notImplemented)
  router.post('/', notImplemented)
  router.patch('/:id', notImplemented)
  router.delete('/:id', notImplemented)
  return router
}
