// @vitest-environment node
import { afterAll, beforeAll, expect, it } from 'vitest'
import type { Server } from 'node:http'
import type { AddressInfo } from 'node:net'
import { createApp } from './app.ts'

let server: Server
let origin: string
beforeAll(async () => {
  server = createApp().listen(0, '127.0.0.1')
  await new Promise<void>((resolve, reject) => { server.once('listening', resolve); server.once('error', reject) })
  origin = `http://127.0.0.1:${(server.address() as AddressInfo).port}`
})
afterAll(async () => {
  if (server?.listening) await new Promise<void>((resolve, reject) => server.close(error => error ? reject(error) : resolve()))
})
it('exposes a healthy API', async () => {
  const response = await fetch(`${origin}/api/health`)
  expect(response.status).toBe(200)
  expect(await response.json()).toEqual({ ok: true })
})
it('observes middleware order and correlates response headers with the body', async () => {
  const response = await fetch(`${origin}/api/reference/pipeline`)
  const body = await response.json() as { ok: boolean; trace: string[]; requestId: string; elapsedMs: number }
  expect(response.status).toBe(200)
  expect(body).toMatchObject({ ok: true, trace: ['request-id', 'timer', 'validation', 'handler'] })
  expect(body.requestId).toBe(response.headers.get('x-request-id'))
  expect(body.elapsedMs).toBeGreaterThanOrEqual(0)
})
it('routes validation errors through error middleware without invoking the success handler', async () => {
  const response = await fetch(`${origin}/api/reference/pipeline?fail=1`)
  expect(response.status).toBe(400)
  expect(await response.json()).toMatchObject({ ok: false, error: 'DEMO_VALIDATION_ERROR', trace: ['request-id', 'timer', 'validation', 'error-handler'] })
})
it('returns JSON for unknown routes and malformed request bodies', async () => {
  const missing = await fetch(`${origin}/api/unknown`)
  expect(missing.status).toBe(404)
  expect(await missing.json()).toMatchObject({ error: 'NOT_FOUND' })
  const invalid = await fetch(`${origin}/api/tasks`, { method: 'POST', headers: { 'Content-Type': 'application/json' }, body: '{broken' })
  expect(invalid.status).toBe(400)
  expect(await invalid.json()).toMatchObject({ error: 'INVALID_JSON' })
})
